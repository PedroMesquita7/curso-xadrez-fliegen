/*
 * logica.js — regras de apoio ao treino (sem interface).
 * Depende da biblioteca chess.js (vendor/chess.min.js), que define window.Chess.
 * Funciona no navegador e no Node (para os testes automáticos).
 */
(function (root) {
  'use strict';

  var XF = root.XF = root.XF || {};

  function novoJogo(fen) {
    return fen ? new root.Chess(fen) : new root.Chess();
  }

  // ---------- Notação em português (T, C, B, D, R) ----------
  var LETRAS_PT = { K: 'R', Q: 'D', R: 'T', B: 'B', N: 'C' };

  function sanPt(san) {
    if (!san) return '';
    var s = san;
    if (/^[KQRBN]/.test(s)) s = LETRAS_PT[s[0]] + s.slice(1);
    s = s.replace(/=([QRBN])/, function (_, l) { return '=' + LETRAS_PT[l]; });
    return s;
  }

  var NOMES_PECAS = { p: 'peão', n: 'cavalo', b: 'bispo', r: 'torre', q: 'dama', k: 'rei' };
  var GENERO_F = { r: true, q: true };

  function nomePeca(tipo, cor) {
    var nome = NOMES_PECAS[tipo];
    var fem = !!GENERO_F[tipo];
    var corTxt = cor === 'w' ? (fem ? 'branca' : 'branco') : (fem ? 'preta' : 'preto');
    return nome + ' ' + corTxt;
  }

  // ---------- Problemas ----------
  function paraLance(m) {
    var o = { from: m.from, to: m.to };
    if (m.promotion) o.promotion = m.promotion;
    return o;
  }

  function lancesDeMateLento(g) {
    var res = [];
    var lances = g.moves({ verbose: true });
    for (var i = 0; i < lances.length; i++) {
      g.move(paraLance(lances[i]));
      if (g.isCheckmate()) res.push(lances[i]);
      g.undo();
    }
    return res;
  }

  function temMateEmUmLento(g) {
    var lances = g.moves({ verbose: true });
    for (var i = 0; i < lances.length; i++) {
      g.move(paraLance(lances[i]));
      var mate = g.isCheckmate();
      g.undo();
      if (mate) return true;
    }
    return false;
  }

  // O lance que acabou de ser feito em g leva a mate forçado no lance seguinte?
  // (todas as respostas do adversário permitem mate em 1)
  function forcaMateEmUmLento(g) {
    if (g.isCheckmate()) return false; // já é mate (tratado à parte)
    if (g.isGameOver()) return false;
    var respostas = g.moves({ verbose: true });
    if (!respostas.length) return false;
    for (var i = 0; i < respostas.length; i++) {
      g.move(paraLance(respostas[i]));
      var ok = temMateEmUmLento(g);
      g.undo();
      if (!ok) return false;
    }
    return true;
  }

  // Primeiros lances que resolvem um "mate em 2" (ou que já dão mate)
  function solucoesMateEm2Lento(fen) {
    var g = novoJogo(fen);
    var sols = [];
    var lances = g.moves({ verbose: true });
    for (var i = 0; i < lances.length; i++) {
      g.move(paraLance(lances[i]));
      if (g.isCheckmate() || forcaMateEmUmLento(g)) sols.push(lances[i]);
      g.undo();
    }
    return sols;
  }

  // Melhor defesa do adversário (a que deixa menos mates ao jogador)
  function respostaDefensivaLento(g) {
    var respostas = g.moves({ verbose: true });
    var melhor = null, menor = Infinity;
    for (var i = 0; i < respostas.length; i++) {
      g.move(paraLance(respostas[i]));
      var n = lancesDeMateLento(g).length;
      g.undo();
      if (n < menor) { menor = n; melhor = respostas[i]; }
    }
    return melhor;
  }

  // ---------- Computador simples ----------
  var VALOR = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

  function avaliar(g) { // positivo = bom para as brancas
    var tab = g.board();
    var s = 0;
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) {
        var p = tab[r][f];
        if (!p) continue;
        var v = VALOR[p.type];
        var centro = 3.5 - Math.max(Math.abs(f - 3.5), Math.abs(r - 3.5)); // 0 (canto) .. 3 (centro)
        var bonus = 0;
        if (p.type === 'n') bonus = centro * 12;
        else if (p.type === 'b') bonus = centro * 6;
        else if (p.type === 'p') {
          var avanco = p.color === 'w' ? (6 - r) : (r - 1); // 0..5
          bonus = avanco * 6 + (f >= 2 && f <= 5 ? 4 : 0);
        }
        s += p.color === 'w' ? (v + bonus) : -(v + bonus);
      }
    }
    return s;
  }

  function ordenar(lances) {
    return lances.slice().sort(function (a, b) {
      var sa = a.captured ? VALOR[a.captured] * 10 - VALOR[a.piece] : 0;
      var sb = b.captured ? VALOR[b.captured] * 10 - VALOR[b.piece] : 0;
      if (a.promotion) sa += 800;
      if (b.promotion) sb += 800;
      return sb - sa;
    });
  }

  function negamax(g, profundidade, alfa, beta, cor) {
    if (g.isCheckmate()) return -(100000 + profundidade);
    if (g.isDraw()) return 0;
    if (profundidade === 0) return cor * avaliar(g);
    var lances = ordenar(g.moves({ verbose: true }));
    var melhor = -Infinity;
    for (var i = 0; i < lances.length; i++) {
      g.move(paraLance(lances[i]));
      var v = -negamax(g, profundidade - 1, -beta, -alfa, -cor);
      g.undo();
      if (v > melhor) melhor = v;
      if (melhor > alfa) alfa = melhor;
      if (alfa >= beta) break;
    }
    return melhor;
  }

  function escolher(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

  // nivel: 'facil' (quase aleatório) ou 'medio' (olha 2 lances à frente)
  function melhorJogadaLenta(jogo, nivel) {
    var g = novoJogo(jogo.fen());
    var lances = g.moves({ verbose: true });
    if (!lances.length) return null;

    if (nivel === 'facil') {
      var mates = lancesDeMateLento(g);
      if (mates.length) return escolher(mates);
      var capturas = lances.filter(function (m) { return !!m.captured; });
      if (capturas.length && Math.random() < 0.5) return escolher(capturas);
      return escolher(lances);
    }

    var cor = g.turn() === 'w' ? 1 : -1;
    var pontuados = [];
    var ordenados = ordenar(lances);
    for (var i = 0; i < ordenados.length; i++) {
      g.move(paraLance(ordenados[i]));
      var v = -negamax(g, 1, -Infinity, Infinity, -cor);
      g.undo();
      pontuados.push({ m: ordenados[i], v: v });
    }
    var maior = -Infinity;
    pontuados.forEach(function (x) { if (x.v > maior) maior = x.v; });
    var empatados = pontuados.filter(function (x) { return x.v >= maior - 12; });
    return escolher(empatados).m;
  }


  // ================================================================
  // Versão rápida: usa o gerador de lances interno do chess.js 1.4.0
  // (sem calcular notação/FEN de cada lance). Se a biblioteca for
  // trocada e a API interna não existir, o código cai nas versões
  // "Lento" acima, que usam só a API pública.
  // ================================================================
  var ARQ = 'abcdefgh';
  function alg(i) { return ARQ.charAt(i & 15) + (8 - (i >> 4)); }

  function temRapido(g) {
    return typeof g._moves === 'function' && typeof g._makeMove === 'function' &&
           typeof g._undoMove === 'function' && !!g._board;
  }

  function gerar(g) { return g._moves({ legal: true }); }

  function ehMateAgora(g) { // o lado que joga agora está em xeque-mate?
    return g.isCheck() && gerar(g).length === 0;
  }

  function verboso(g, m) {
    var lista = g.moves({ square: alg(m.from), verbose: true });
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].to === alg(m.to) && (lista[i].promotion || '') === (m.promotion || '')) return lista[i];
    }
    return null;
  }

  function mateEmUmRapido(g, soExiste) {
    var lances = gerar(g), achados = [];
    for (var i = 0; i < lances.length; i++) {
      g._makeMove(lances[i]);
      var mate = ehMateAgora(g);
      g._undoMove();
      if (mate) { if (soExiste) return true; achados.push(lances[i]); }
    }
    return soExiste ? false : achados;
  }

  function lancesDeMate(g) {
    if (!temRapido(g)) return lancesDeMateLento(g);
    return mateEmUmRapido(g, false).map(function (m) { return verboso(g, m); });
  }

  function temMateEmUm(g) {
    if (!temRapido(g)) return temMateEmUmLento(g);
    return mateEmUmRapido(g, true);
  }

  // Depois de um lance feito em g: todas as respostas permitem mate em 1?
  function forcaMateEmUmRapido(g) {
    var respostas = gerar(g);
    if (!respostas.length) return false; // mate ou afogamento: tratado à parte
    for (var i = 0; i < respostas.length; i++) {
      g._makeMove(respostas[i]);
      var ok = mateEmUmRapido(g, true);
      g._undoMove();
      if (!ok) return false;
    }
    return true;
  }

  function forcaMateEmUm(g) {
    if (!temRapido(g)) return forcaMateEmUmLento(g);
    if (g.isGameOver()) return false;
    return forcaMateEmUmRapido(g);
  }

  function solucoesMateEm2(fen) {
    var g = novoJogo(fen);
    if (!temRapido(g)) return solucoesMateEm2Lento(fen);
    var lances = gerar(g), sols = [];
    for (var i = 0; i < lances.length; i++) {
      g._makeMove(lances[i]);
      var ok = ehMateAgora(g) || forcaMateEmUmRapido(g);
      g._undoMove();
      if (ok) sols.push(lances[i]);
    }
    return sols.map(function (m) { return verboso(g, m); });
  }

  function respostaDefensiva(g) {
    if (!temRapido(g)) return respostaDefensivaLento(g);
    var respostas = gerar(g), melhor = null, menor = Infinity;
    for (var i = 0; i < respostas.length; i++) {
      g._makeMove(respostas[i]);
      var n = mateEmUmRapido(g, false).length;
      g._undoMove();
      if (n < menor) { menor = n; melhor = respostas[i]; }
    }
    return melhor ? verboso(g, melhor) : null;
  }

  // ---- avaliação e busca (rápidas) ----
  function avaliarRapido(g) { // positivo = bom para as brancas
    var b = g._board, s = 0;
    for (var i = 0; i < 128; i++) {
      if (i & 0x88) { i += 7; continue; }
      var p = b[i];
      if (!p) continue;
      var r = i >> 4, f = i & 15;
      var v = VALOR[p.type];
      var centro = 3.5 - Math.max(Math.abs(f - 3.5), Math.abs(r - 3.5));
      var bonus = 0;
      if (p.type === 'n') bonus = centro * 12;
      else if (p.type === 'b') bonus = centro * 6;
      else if (p.type === 'p') {
        var avanco = p.color === 'w' ? (6 - r) : (r - 1);
        bonus = avanco * 6 + (f >= 2 && f <= 5 ? 4 : 0);
      }
      s += p.color === 'w' ? (v + bonus) : -(v + bonus);
    }
    return s;
  }

  function ordenarRapido(lances) {
    return lances.slice().sort(function (a, b) {
      var sa = a.captured ? VALOR[a.captured] * 10 - VALOR[a.piece] : 0;
      var sb = b.captured ? VALOR[b.captured] * 10 - VALOR[b.piece] : 0;
      if (a.promotion) sa += 800;
      if (b.promotion) sb += 800;
      return sb - sa;
    });
  }

  function negamaxRapido(g, profundidade, alfa, beta, cor) {
    if (profundidade === 0) {
      if (g.isCheck() && gerar(g).length === 0) return -(100000);
      return cor * avaliarRapido(g);
    }
    var lances = gerar(g);
    if (!lances.length) return g.isCheck() ? -(100000 + profundidade) : 0;
    lances = ordenarRapido(lances);
    var melhor = -Infinity;
    for (var i = 0; i < lances.length; i++) {
      g._makeMove(lances[i]);
      var v = -negamaxRapido(g, profundidade - 1, -beta, -alfa, -cor);
      g._undoMove();
      if (v > melhor) melhor = v;
      if (melhor > alfa) alfa = melhor;
      if (alfa >= beta) break;
    }
    return melhor;
  }

  // nivel: 'facil' (quase aleatório) ou 'medio' (olha 2 lances à frente)
  function melhorJogada(jogo, nivel) {
    var g = novoJogo(jogo.fen());
    if (!temRapido(g)) return melhorJogadaLenta(jogo, nivel);
    var lances = gerar(g);
    if (!lances.length) return null;
    var escolhido;

    if (nivel === 'facil') {
      var mates = mateEmUmRapido(g, false);
      if (mates.length) escolhido = escolher(mates);
      else {
        var capturas = lances.filter(function (m) { return !!m.captured; });
        escolhido = (capturas.length && Math.random() < 0.5) ? escolher(capturas) : escolher(lances);
      }
    } else {
      var cor = g.turn() === 'w' ? 1 : -1;
      var pontuados = [];
      var ordenados = ordenarRapido(lances);
      for (var i = 0; i < ordenados.length; i++) {
        g._makeMove(ordenados[i]);
        var v = -negamaxRapido(g, 1, -Infinity, Infinity, -cor);
        g._undoMove();
        pontuados.push({ m: ordenados[i], v: v });
      }
      var maior = -Infinity;
      pontuados.forEach(function (x) { if (x.v > maior) maior = x.v; });
      var empatados = pontuados.filter(function (x) { return x.v >= maior - 12; });
      escolhido = escolher(empatados).m;
    }
    return verboso(g, escolhido);
  }

  // ---------- Fim de jogo em linguagem simples ----------
  function resultadoPartida(g) {
    if (g.isCheckmate()) {
      var venceu = g.turn() === 'w' ? 'pretas' : 'brancas';
      return { fim: true, vencedor: venceu === 'brancas' ? 'w' : 'b', texto: 'Xeque-mate! As ' + venceu + ' venceram.' };
    }
    if (g.isStalemate()) return { fim: true, vencedor: null, texto: 'Empate por afogamento: quem joga não tem lance legal e o rei não está em xeque.' };
    if (g.isInsufficientMaterial()) return { fim: true, vencedor: null, texto: 'Empate: não há peças suficientes para dar xeque-mate.' };
    if (g.isThreefoldRepetition()) return { fim: true, vencedor: null, texto: 'Empate por repetição: a mesma posição apareceu três vezes.' };
    if (g.isDraw()) return { fim: true, vencedor: null, texto: 'Empate pela regra dos 50 lances sem captura nem movimento de peão.' };
    return { fim: false };
  }

  XF.logica = {
    novoJogo: novoJogo,
    sanPt: sanPt,
    nomePeca: nomePeca,
    paraLance: paraLance,
    lancesDeMate: lancesDeMate,
    temMateEmUm: temMateEmUm,
    forcaMateEmUm: forcaMateEmUm,
    solucoesMateEm2: solucoesMateEm2,
    respostaDefensiva: respostaDefensiva,
    melhorJogada: melhorJogada,
    resultadoPartida: resultadoPartida,
    _lento: { lancesDeMate: lancesDeMateLento, temMateEmUm: temMateEmUmLento, forcaMateEmUm: forcaMateEmUmLento, solucoesMateEm2: solucoesMateEm2Lento, respostaDefensiva: respostaDefensivaLento }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = XF.logica;
})(typeof window !== 'undefined' ? window : globalThis);
