/*
 * aulas-motor.js — regras dos exercícios das "Aulas práticas" (sem interface).
 *  - Exercícios de estrelas: movimento das peças sem rei nem adversário que se mexe,
 *    com cálculo do menor número de lances (busca em largura).
 *  - Exercícios de xadrez: confere o objetivo de cada lance usando a chess.js.
 *  - validar(): confere se cada exercício tem solução (usado na página de verificação).
 * Funciona no navegador e no Node (testes automáticos).
 */
(function (root) {
  'use strict';
  var XF = root.XF = root.XF || {};
  var ARQ = 'abcdefgh';
  var VALOR = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
  var NOME = { p: 'peão', n: 'cavalo', b: 'bispo', r: 'torre', q: 'dama', k: 'rei' };

  function xy(s) { return [ARQ.indexOf(s[0]), parseInt(s[1], 10) - 1]; }
  function casa(x, y) { return (x < 0 || x > 7 || y < 0 || y > 7) ? null : ARQ[x] + (y + 1); }
  function casaValida(s) { return typeof s === 'string' && /^[a-h][1-8]$/.test(s); }

  var LINHAS = { r: [[1, 0], [-1, 0], [0, 1], [0, -1]], b: [[1, 1], [1, -1], [-1, 1], [-1, -1]] };
  LINHAS.q = LINHAS.r.concat(LINHAS.b);
  var SALTOS = {
    n: [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]],
    k: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
  };

  // ======================================================= estrelas
  // estado: { brancas: [{sq, t, fixa}], pretas: {sq: t}, estrelas: {sq: true} }
  function estadoInicial(ex) {
    var est = { brancas: [], pretas: {}, estrelas: {} };
    Object.keys(ex.pecas || {}).forEach(function (s) { est.brancas.push({ sq: s, t: ex.pecas[s], fixa: false }); });
    Object.keys(ex.fixas || {}).forEach(function (s) { est.brancas.push({ sq: s, t: ex.fixas[s], fixa: true }); });
    Object.keys(ex.pretas || {}).forEach(function (s) { est.pretas[s] = ex.pretas[s]; });
    (ex.estrelas || []).forEach(function (s) { est.estrelas[s] = true; });
    return est;
  }

  function brancaEm(est, s) {
    for (var i = 0; i < est.brancas.length; i++) if (est.brancas[i].sq === s) return i;
    return -1;
  }

  // Lances possíveis da peça branca de índice i: [{to, captura}]
  function destinos(est, i) {
    var p = est.brancas[i];
    if (!p || p.fixa) return [];
    var res = [];
    var o = xy(p.sq);
    function livre(s) { return brancaEm(est, s) < 0 && !est.pretas[s]; }
    if (p.t === 'p') {
      var f1 = casa(o[0], o[1] + 1);
      if (f1 && livre(f1)) {
        res.push({ to: f1, captura: false });
        var f2 = casa(o[0], o[1] + 2);
        if (o[1] === 1 && f2 && livre(f2)) res.push({ to: f2, captura: false });
      }
      [-1, 1].forEach(function (dx) {
        var d = casa(o[0] + dx, o[1] + 1);
        if (d && est.pretas[d]) res.push({ to: d, captura: true });
      });
      return res;
    }
    if (SALTOS[p.t]) {
      SALTOS[p.t].forEach(function (v) {
        var d = casa(o[0] + v[0], o[1] + v[1]);
        if (!d || brancaEm(est, d) >= 0) return;
        res.push({ to: d, captura: !!est.pretas[d] });
      });
      return res;
    }
    (LINHAS[p.t] || []).forEach(function (v) {
      var x = o[0], y = o[1];
      for (;;) {
        x += v[0]; y += v[1];
        var d = casa(x, y);
        if (!d || brancaEm(est, d) >= 0) break;
        if (est.pretas[d]) { res.push({ to: d, captura: true }); break; }
        res.push({ to: d, captura: false });
      }
    });
    return res;
  }

  function copiar(est) {
    var n = { brancas: est.brancas.map(function (p) { return { sq: p.sq, t: p.t, fixa: p.fixa }; }), pretas: {}, estrelas: {} };
    for (var a in est.pretas) n.pretas[a] = est.pretas[a];
    for (var b in est.estrelas) n.estrelas[b] = true;
    return n;
  }

  // Executa o lance (sem conferir se é permitido). Devolve { est, estrela, capturou, promoveu }
  function mover(est, i, para) {
    var n = copiar(est);
    var p = n.brancas[i];
    var info = { est: n, estrela: false, capturou: null, promoveu: false };
    p.sq = para;
    if (n.pretas[para]) { info.capturou = n.pretas[para]; delete n.pretas[para]; }
    if (n.estrelas[para]) { info.estrela = true; delete n.estrelas[para]; }
    if (p.t === 'p' && para[1] === '8') { p.t = 'q'; info.promoveu = true; }
    return info;
  }

  function faltam(est) { return Object.keys(est.estrelas).length + Object.keys(est.pretas).length; }

  function chave(est) {
    return est.brancas.map(function (p) { return p.sq + p.t; }).join(',') + '|' +
      Object.keys(est.estrelas).sort().join('') + '|' + Object.keys(est.pretas).sort().join('');
  }

  // Menor número de lances para terminar a partir de est (-1 se impossível)
  function minimo(est, limite) {
    if (!faltam(est)) return 0;
    limite = limite || 200000;
    var fila = [est], prof = [0], vistos = {}, k = 0;
    vistos[chave(est)] = true;
    while (k < fila.length) {
      var e = fila[k], d = prof[k]; k++;
      for (var i = 0; i < e.brancas.length; i++) {
        var ds = destinos(e, i);
        for (var j = 0; j < ds.length; j++) {
          var n = mover(e, i, ds[j].to).est;
          if (!faltam(n)) return d + 1;
          var c = chave(n);
          if (vistos[c]) continue;
          vistos[c] = true;
          fila.push(n); prof.push(d + 1);
          if (fila.length > limite) return -1;
        }
      }
    }
    return -1;
  }

  // Primeiro lance de um caminho mais curto (para a dica): {i, to} ou null
  function melhorLance(est) {
    var alvo = minimo(est);
    if (alvo <= 0) return null;
    for (var i = 0; i < est.brancas.length; i++) {
      var ds = destinos(est, i);
      for (var j = 0; j < ds.length; j++) {
        var n = mover(est, i, ds[j].to).est;
        if ((faltam(n) === 0 ? 0 : minimo(n)) === alvo - 1) return { i: i, from: est.brancas[i].sq, to: ds[j].to };
      }
    }
    return null;
  }

  // Tabuleiro no formato usado por XF.Tabuleiro.desenhar
  function pecasParaDesenho(est) {
    var linha = [];
    est.brancas.forEach(function (p) { linha.push({ square: p.sq, type: p.t, color: 'w' }); });
    Object.keys(est.pretas).forEach(function (s) { linha.push({ square: s, type: est.pretas[s], color: 'b' }); });
    return [linha];
  }

  // Lê a parte de peças de um FEN (sem exigir reis), para os exercícios "casa"
  function pecasDaPosicao(pos) {
    var linha = [];
    var fileiras = (pos || '8/8/8/8/8/8/8/8').split(' ')[0].split('/');
    for (var r = 0; r < 8; r++) {
      var x = 0;
      for (var c = 0; c < (fileiras[r] || '').length; c++) {
        var ch = fileiras[r][c];
        if (/[1-8]/.test(ch)) { x += parseInt(ch, 10); continue; }
        linha.push({ square: ARQ[x] + (8 - r), type: ch.toLowerCase(), color: ch === ch.toUpperCase() ? 'w' : 'b' });
        x++;
      }
    }
    return [linha];
  }

  // ======================================================= xadrez
  function novoJogo(fen) { return new root.Chess(fen); }
  function semSinais(san) { return String(san || '').replace(/[+#!?]/g, ''); }

  // Peças brancas (menos o rei) que podem ser capturadas com vantagem pelas pretas
  function pecasEmPerigo(g) {
    var lista = [];
    g.board().forEach(function (linha) {
      linha.forEach(function (p) {
        if (!p || p.color !== 'w' || p.type === 'k') return;
        var atacantes = g.attackers(p.square, 'b');
        if (!atacantes.length) return;
        var defendida = g.attackers(p.square, 'w').length > 0;
        var menor = Math.min.apply(null, atacantes.map(function (s) { return VALOR[g.get(s).type]; }));
        if (!defendida || menor < VALOR[p.type]) lista.push(p);
      });
    });
    return lista;
  }

  function frasePerigo(lista) {
    var p = lista[0];
    var fem = p.type === 'q' || p.type === 'r';
    return 'Cuidado: ' + (fem ? 'sua ' : 'seu ') + NOME[p.type] + ' em ' + p.square + ' ainda pode ser capturad' + (fem ? 'a' : 'o') + '.';
  }

  // g já com o lance m feito (vez das pretas). Devolve { ok, msg }
  function avaliar(ex, g, m) {
    var obj = ex.objetivo;
    if (obj === 'xeque') {
      return g.isCheck() ? { ok: true, msg: 'Xeque! O rei preto está sendo atacado.' } : { ok: false, msg: 'Esse lance não ataca o rei preto. Tente de novo.' };
    }
    if (obj === 'mate') {
      if (g.isCheckmate()) return { ok: true, msg: 'Xeque-mate! O rei preto não tem como escapar.' };
      if (g.isStalemate()) return { ok: false, msg: 'Ops: o rei preto ficou afogado (sem lances e sem xeque). Isso é empate! Tente de novo.' };
      if (g.isCheck()) return { ok: false, msg: 'É xeque, mas o rei preto ainda consegue escapar. Tente de novo.' };
      return { ok: false, msg: 'Esse lance não é xeque-mate. Tente de novo.' };
    }
    if (obj === 'sair-xeque') {
      var como = m.piece === 'k' ? 'Você fugiu com o rei.' : (m.captured ? 'Você capturou a peça que dava xeque.' : 'Você bloqueou o xeque.');
      return { ok: true, msg: 'Rei salvo! ' + como };
    }
    if (obj === 'afogar') {
      if (g.isStalemate()) return { ok: true, msg: 'Afogado! O rei preto não está em xeque, mas não tem nenhum lance: empate.' };
      if (g.isCheck()) return { ok: false, msg: 'Esse lance dá xeque. No afogamento, o rei NÃO está em xeque. Tente de novo.' };
      return { ok: false, msg: 'O rei preto ainda tem lances. Tente de novo.' };
    }
    if (obj === 'roque') {
      if (m.flags.indexOf('k') >= 0) return { ok: true, msg: 'Roque pequeno feito! O rei foi para g1 e a torre para f1.' };
      if (m.flags.indexOf('q') >= 0) return { ok: true, msg: 'Roque grande feito! O rei foi para c1 e a torre para d1.' };
      return { ok: false, msg: 'Isso não foi um roque. Toque no rei e depois na casa duas casas ao lado.' };
    }
    if (obj === 'enpassant') {
      return m.flags.indexOf('e') >= 0 ? { ok: true, msg: 'En passant! Você capturou o peão "de passagem".' } : { ok: false, msg: 'Esse não foi o en passant. Seu peão captura na diagonal, para a casa vazia atrás do peão preto.' };
    }
    if (obj === 'seguro') {
      var perigo = pecasEmPerigo(g);
      return perigo.length ? { ok: false, msg: frasePerigo(perigo) + ' Tente de novo.' } : { ok: true, msg: 'Muito bem! Nenhuma peça sua pode ser capturada de graça.' };
    }
    if (obj === 'captura-segura') {
      if (!m.captured) return { ok: false, msg: 'Procure uma captura.' };
      var p2 = pecasEmPerigo(g);
      if (p2.length) return { ok: false, msg: frasePerigo(p2) + ' Essa peça preta estava protegida.' };
      return { ok: true, msg: 'Boa captura! Você ganhou ' + (m.captured === 'p' ? 'um peão' : 'a peça') + ' sem perder nada.' };
    }
    if (obj === 'lance') {
      var id = m.from + m.to + (m.promotion || '');
      var certo = (ex.solucoes || []).some(function (s) { return s === id || s === m.from + m.to; });
      return certo ? { ok: true, msg: ex.acerto || 'Isso mesmo! Ótimo lance.' } : { ok: false, msg: ex.erro || 'Não é esse lance. Tente de novo.' };
    }
    return { ok: false, msg: 'Objetivo desconhecido.' };
  }

  // Lances que cumprem o objetivo (para dicas e validação). Para "linha", só o passo informado.
  function solucoes(ex, g, passo) {
    var lances = g.moves({ verbose: true });
    if (ex.objetivo === 'linha') {
      var p = ex.passos[passo || 0];
      return lances.filter(function (m) { return p.brancas.some(function (b) { return semSinais(b) === semSinais(m.san); }); });
    }
    return lances.filter(function (m) {
      g.move({ from: m.from, to: m.to, promotion: m.promotion });
      var r = avaliar(ex, g, m).ok;
      g.undo();
      return r;
    });
  }

  // ======================================================= validação
  function validar(ex) {
    try {
      if (ex.tipo === 'estrelas') {
        var est = estadoInicial(ex);
        var todas = [].concat(Object.keys(ex.pecas || {}), Object.keys(ex.fixas || {}), Object.keys(ex.pretas || {}), ex.estrelas || []);
        if (!todas.every(casaValida)) return { ok: false, info: 'há uma casa inválida' };
        if (!Object.keys(ex.pecas || {}).length) return { ok: false, info: 'não há peça para mover' };
        if (!faltam(est)) return { ok: false, info: 'não há estrelas nem peças para capturar' };
        var n = minimo(est);
        return n > 0 ? { ok: true, info: 'dá para fazer em ' + n + ' lance(s)', minimo: n } : { ok: false, info: 'impossível pegar todas as estrelas' };
      }
      if (ex.tipo === 'casa') {
        var ok = (ex.resposta || []).length > 0 && ex.resposta.every(casaValida);
        return { ok: ok, info: ok ? 'resposta: ' + ex.resposta.join(' ou ') : 'resposta inválida' };
      }
      if (ex.tipo === 'xadrez') {
        var g = novoJogo(ex.fen);
        if (g.turn() !== 'w') return { ok: false, info: 'nas aulas, as brancas devem jogar' };
        var outro = ex.fen.replace(' w ', ' b ');
        try { if (novoJogo(outro).isCheck()) return { ok: false, info: 'posição ilegal: o rei preto está em xeque com as brancas jogando' }; } catch (e) { /* ignora */ }
        if (ex.objetivo === 'linha') {
          for (var k = 0; k < ex.passos.length; k++) {
            var s = solucoes(ex, g, k);
            if (!s.length) return { ok: false, info: 'o lance ' + ex.passos[k].brancas.join('/') + ' do passo ' + (k + 1) + ' não é possível' };
            g.move({ from: s[0].from, to: s[0].to, promotion: s[0].promotion });
            if (ex.passos[k].pretas) {
              try { g.move(ex.passos[k].pretas); } catch (e) { return { ok: false, info: 'a resposta ' + ex.passos[k].pretas + ' das pretas não é possível' }; }
            }
          }
          return { ok: true, info: ex.passos.length + ' passo(s) conferido(s)' };
        }
        var total = g.moves().length;
        var sols = solucoes(ex, g);
        if (!sols.length) return { ok: false, info: 'nenhum lance cumpre o objetivo' };
        if (ex.objetivo !== 'sair-xeque' && sols.length === total) return { ok: false, info: 'qualquer lance serve (exercício fácil demais)' };
        return { ok: true, info: sols.length + ' de ' + total + ' lances resolvem' };
      }
      return { ok: false, info: 'tipo de exercício desconhecido' };
    } catch (e) {
      return { ok: false, info: 'erro: ' + e.message };
    }
  }

  XF.aulasMotor = {
    VALOR: VALOR, NOME: NOME,
    estadoInicial: estadoInicial, destinos: destinos, mover: mover, faltam: faltam,
    minimo: minimo, melhorLance: melhorLance, brancaEm: brancaEm,
    pecasParaDesenho: pecasParaDesenho, pecasDaPosicao: pecasDaPosicao,
    novoJogo: novoJogo, semSinais: semSinais, avaliar: avaliar, solucoes: solucoes,
    pecasEmPerigo: pecasEmPerigo, validar: validar
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = XF.aulasMotor;
})(typeof window !== 'undefined' ? window : globalThis);
