/*
 * treinar.js — página "Treinar": problemas de mate e partida contra o computador.
 * Tudo roda no próprio navegador. O progresso fica salvo só neste aparelho.
 */
(function (root) {
  'use strict';
  var XF = root.XF;
  var L = XF.logica;
  var $ = XF.$;
  var doc = root.document;

  // =========================================================== abas
  var ABAS = {
    problemas: [$('#aba-problemas'), $('#painel-problemas')],
    jogar: [$('#aba-jogar'), $('#painel-jogar')],
    dupla: [$('#aba-dupla'), $('#painel-dupla')]
  };
  var ORDEM_ABAS = ['problemas', 'jogar', 'dupla'];

  function mostrarAba(qual, focar) {
    ORDEM_ABAS.forEach(function (k) {
      var ativa = k === qual;
      ABAS[k][0].setAttribute('aria-selected', String(ativa));
      ABAS[k][0].tabIndex = ativa ? 0 : -1;
      ABAS[k][1].hidden = !ativa;
    });
    if (focar) ABAS[qual][0].focus();
  }
  ORDEM_ABAS.forEach(function (k, i) {
    ABAS[k][0].addEventListener('click', function () { mostrarAba(k); });
    ABAS[k][0].addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var passo = e.key === 'ArrowRight' ? 1 : -1;
        mostrarAba(ORDEM_ABAS[(i + passo + ORDEM_ABAS.length) % ORDEM_ABAS.length], true);
      }
    });
  });

  // =========================================================== problemas
  var cat = 'mate1';
  var idx = 0;
  var fase = 'primeiro';      // primeiro | segundo | resolvido
  var jogo = null;
  var lado = 'w';
  var respondendo = false;    // true enquanto o adversário responde sozinho
  var dicasUsadas = 0;
  var resolvidos = XF.ler('resolvidos', {});

  var tabP = new XF.Tabuleiro($('#tab-problema'), { rotulo: 'Tabuleiro do problema' });
  var interP = new XF.Interacao(tabP, L.novoJogo(), {
    podeSelecionar: function () { return fase !== 'resolvido' && !respondendo; },
    aoMover: aoMoverProblema
  });

  var elMsg = $('#prob-msg');
  function msgP(texto, tipo) {
    elMsg.className = 'msg ' + (tipo || 'info');
    elMsg.textContent = texto;
  }

  function lista() { return XF.PROBLEMAS[cat].lista; }
  function atual() { return lista()[idx]; }
  function feitosDaCategoria() { return resolvidos[cat] || []; }

  function desenharCategorias() {
    var caixa = $('#categorias');
    caixa.innerHTML = '';
    Object.keys(XF.PROBLEMAS).forEach(function (k) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'aba';
      b.setAttribute('aria-pressed', String(k === cat));
      var total = XF.PROBLEMAS[k].lista.length;
      var feitos = (resolvidos[k] || []).length;
      b.textContent = XF.PROBLEMAS[k].titulo + ' (' + feitos + '/' + total + ')';
      b.addEventListener('click', function () { cat = k; idx = 0; desenharCategorias(); carregar(0); });
      caixa.appendChild(b);
    });
  }

  function desenharChips() {
    var ul = $('#prob-chips');
    ul.innerHTML = '';
    var feitos = feitosDaCategoria();
    lista().forEach(function (p, i) {
      var li = doc.createElement('li');
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (feitos.indexOf(p.id) >= 0 ? ' feito' : '');
      b.textContent = String(i + 1);
      b.setAttribute('aria-label', 'Problema ' + (i + 1) + (feitos.indexOf(p.id) >= 0 ? ', resolvido' : ''));
      if (i === idx) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', function () { carregar(i); });
      li.appendChild(b);
      ul.appendChild(li);
    });
    var total = lista().length;
    $('#prob-progresso').textContent = 'Você resolveu ' + feitos.length + ' de ' + total + ' problemas de ' + XF.PROBLEMAS[cat].titulo + '. O progresso fica salvo só neste aparelho.';
  }

  function carregar(i) {
    idx = i;
    var p = atual();
    jogo = L.novoJogo(p.fen);
    lado = jogo.turn();
    fase = 'primeiro';
    respondendo = false;
    dicasUsadas = 0;
    tabP.definirOrientacao(lado);
    interP.definirJogo(jogo);
    // com o teclado, o Tab chega primeiro ao seu rei (sem entregar a solução)
    jogo.board().forEach(function (linha) {
      linha.forEach(function (pc) { if (pc && pc.type === 'k' && pc.color === lado) tabP.definirFoco(pc.square); });
    });
    $('#prob-titulo').textContent = 'Problema ' + (i + 1) + ': ' + p.titulo;
    var quem = lado === 'w' ? 'Brancas' : 'Pretas';
    $('#prob-objetivo').textContent = cat === 'mate1'
      ? quem + ' jogam e dão xeque-mate em 1 lance.'
      : quem + ' jogam e dão xeque-mate em 2 lances (seu lance, a resposta do adversário e o mate).';
    msgP('Sua vez! Toque na peça e depois na casa de destino.', 'info');
    desenharChips();
    desenharCategorias();
  }

  function errado(texto) {
    interP.bloqueado = true;
    msgP(texto, 'erro');
    setTimeout(function () {
      jogo.undo();
      interP.ultimo = null;
      interP.bloqueado = false;
      interP.redesenhar();
      msgP('O lance voltou. Tente de novo! Se precisar, use a Dica.', 'info');
    }, 1300);
  }

  function resolver() {
    fase = 'resolvido';
    var feitos = resolvidos[cat] || [];
    if (feitos.indexOf(atual().id) < 0) feitos.push(atual().id);
    resolvidos[cat] = feitos;
    XF.guardar('resolvidos', resolvidos);
    interP.bloqueado = true;
    msgP('Xeque-mate! Muito bem, você resolveu o problema! ✓', 'ok');
    desenharChips();
    desenharCategorias();
  }

  function aoMoverProblema(m) {
    if (respondendo) { respondendo = false; return; }
    if (jogo.isCheckmate()) { resolver(); return; }

    if (cat === 'mate1') {
      errado('Esse lance não dá xeque-mate. Veja o que o rei ainda pode fazer.');
      return;
    }
    // mate em 2
    if (fase === 'primeiro') {
      if (L.forcaMateEmUm(jogo)) {
        interP.bloqueado = true;
        respondendo = true;
        msgP('Ótimo lance! O adversário vai responder...', 'info');
        setTimeout(function () {
          var r = L.respostaDefensiva(jogo);
          fase = 'segundo';
          interP.bloqueado = false;
          interP.jogarLance(r);
          msgP('O adversário jogou ' + L.sanPt(r.san) + '. Agora dê o xeque-mate!', 'info');
        }, 900);
      } else {
        errado('Esse lance não leva ao mate no lance seguinte. Pense em como tirar as casas de fuga do rei.');
      }
    } else {
      errado('Ainda não é xeque-mate. Procure um xeque em que o rei não tenha para onde ir.');
    }
  }

  function lancesDeSolucao() {
    if (cat === 'mate1' || fase === 'segundo') return L.lancesDeMate(jogo);
    return L.solucoesMateEm2(jogo.fen());
  }

  $('#prob-dica').addEventListener('click', function () {
    if (fase === 'resolvido') { msgP('Você já resolveu este problema. Experimente o próximo!', 'info'); return; }
    dicasUsadas++;
    if (dicasUsadas === 1) {
      msgP('Dica: ' + atual().dica, 'info');
    } else {
      var sols = lancesDeSolucao();
      if (sols.length) {
        interP.dica = [sols[0].from];
        interP.redesenhar();
        msgP('Dica: mexa na peça marcada com moldura roxa. Dica: ' + atual().dica, 'info');
      }
    }
  });

  $('#prob-solucao').addEventListener('click', function () {
    if (fase === 'resolvido') { msgP('Você já resolveu este problema.', 'info'); return; }
    var sols = lancesDeSolucao();
    if (!sols.length) return;
    interP.dica = [sols[0].from, sols[0].to];
    interP.redesenhar();
    var nomes = sols.map(function (m) { return L.sanPt(m.san); }).join(' ou ');
    if (cat === 'mate1' || fase === 'segundo') msgP('Solução: ' + nomes + '. As casas de origem e de destino estão marcadas. Agora faça o lance você mesmo!', 'info');
    else msgP('A solução começa com ' + nomes + '. Faça esse lance; depois do adversário responder, dê o xeque-mate.', 'info');
  });

  $('#prob-reiniciar').addEventListener('click', function () { carregar(idx); });
  $('#prob-proximo').addEventListener('click', function () { carregar((idx + 1) % lista().length); });

  // =========================================================== partida contra o computador
  var jogoP = null;
  var corJogador = 'w';
  var nivel = 'facil';
  var pensando = false;
  var jogadaComputador = false;
  var fimDeJogo = false;

  var tabJ = new XF.Tabuleiro($('#tab-jogo'), { rotulo: 'Tabuleiro da partida' });
  var interJ = new XF.Interacao(tabJ, L.novoJogo(), {
    podeSelecionar: function () { return !pensando && !fimDeJogo && jogoP && jogoP.turn() === corJogador; },
    aoMover: aoMoverPartida
  });
  var elMsgJ = $('#jogo-msg');
  function msgJ(texto, tipo) {
    elMsgJ.className = 'msg ' + (tipo || 'info');
    elMsgJ.textContent = texto;
  }

  function atualizarLances() {
    var h = jogoP.history();
    var partes = [];
    for (var i = 0; i < h.length; i += 2) {
      var n = i / 2 + 1;
      partes.push(n + '. ' + L.sanPt(h[i]) + (h[i + 1] ? ' ' + L.sanPt(h[i + 1]) : ''));
    }
    var caixa = $('#jogo-lances');
    caixa.textContent = partes.length ? partes.join('   ') : 'Nenhum lance ainda.';
    caixa.scrollTop = caixa.scrollHeight;
  }

  function terminou() {
    var r = L.resultadoPartida(jogoP);
    if (!r.fim) return false;
    fimDeJogo = true;
    pensando = false;
    interJ.bloqueado = true;
    interJ.sel = null; interJ.alvos = [];
    interJ.redesenhar();
    if (r.vencedor === corJogador) msgJ('🎉 ' + r.texto + ' Parabéns, você venceu!', 'ok');
    else if (r.vencedor) msgJ(r.texto + ' O computador venceu desta vez. Tente de novo!', 'erro');
    else msgJ(r.texto, 'info');
    return true;
  }

  function textoVez() {
    return (jogoP.isCheck() ? 'Você está em xeque! ' : '') + 'Sua vez.';
  }

  function vezDoComputador() {
    pensando = true;
    interJ.bloqueado = true;
    msgJ('O computador está pensando...', 'info');
    setTimeout(function () {
      if (!jogoP) return;
      var mv = L.melhorJogada(jogoP, nivel);
      pensando = false;
      interJ.bloqueado = false;
      if (!mv) { terminou(); return; }
      jogadaComputador = true;
      interJ.jogarLance(mv);
      if (!terminou()) msgJ('O computador jogou ' + L.sanPt(mv.san) + '. ' + textoVez(), 'info');
    }, 450);
  }

  function aoMoverPartida() {
    atualizarLances();
    if (jogadaComputador) { jogadaComputador = false; return; }
    if (terminou()) return;
    if (jogoP.turn() !== corJogador) vezDoComputador();
  }

  function comecar() {
    corJogador = $('input[name="cor"]:checked').value;
    nivel = $('input[name="nivel"]:checked').value;
    jogoP = L.novoJogo();
    fimDeJogo = false;
    pensando = false;
    jogadaComputador = false;
    tabJ.definirOrientacao(corJogador);
    interJ.definirJogo(jogoP);
    $('#jogo-opcoes').hidden = true;
    $('#jogo-area').hidden = false;
    atualizarLances();
    if (corJogador === 'b') vezDoComputador();
    else msgJ('Você joga com as brancas. Sua vez! Toque na peça e depois na casa de destino.', 'info');
  }

  $('#jogo-comecar').addEventListener('click', comecar);

  $('#jogo-nova').addEventListener('click', function () {
    pensando = false;
    jogoP = null;
    $('#jogo-area').hidden = true;
    $('#jogo-opcoes').hidden = false;
    var primeiro = $('#jogo-opcoes input[type="radio"]');
    if (primeiro) primeiro.focus();
  });

  $('#jogo-virar').addEventListener('click', function () { tabJ.virar(); interJ.redesenhar(); });

  $('#jogo-dica').addEventListener('click', function () {
    if (!jogoP || fimDeJogo || pensando || jogoP.turn() !== corJogador) return;
    var mv = L.melhorJogada(jogoP, 'medio');
    if (!mv) return;
    interJ.dica = [mv.from, mv.to];
    interJ.redesenhar();
    msgJ('Dica: experimente ' + L.sanPt(mv.san) + ' (da casa ' + mv.from + ' para ' + mv.to + '). As duas casas estão marcadas.', 'info');
  });

  $('#jogo-desfazer').addEventListener('click', function () {
    if (!jogoP || pensando || !jogoP.history().length) return;
    jogoP.undo();
    if (jogoP.history().length && jogoP.turn() !== corJogador) jogoP.undo();
    fimDeJogo = false;
    interJ.bloqueado = false;
    interJ.ultimo = null; interJ.sel = null; interJ.alvos = []; interJ.dica = null;
    interJ.redesenhar();
    atualizarLances();
    if (jogoP.turn() !== corJogador) vezDoComputador();
    else msgJ('Lance desfeito. ' + textoVez(), 'info');
  });

  // =========================================================== partida em dupla (mesmo aparelho)
  var jogoD = null;
  var nomeB = 'Brancas';
  var nomeP = 'Pretas';
  var giro = 'fixo';
  var fimD = false;
  var fimManual = false;      // desistência ou empate combinado (não mexe nas peças)
  var aoConfirmar = null;

  var tabD = new XF.Tabuleiro($('#tab-dupla'), { rotulo: 'Tabuleiro da partida em dupla' });
  var interD = new XF.Interacao(tabD, L.novoJogo(), {
    podeSelecionar: function () { return !!jogoD && !fimD && !aoConfirmar; },
    aoMover: aoMoverDupla
  });
  var elMsgD = $('#dupla-msg');
  function msgD(texto, tipo) {
    elMsgD.className = 'msg ' + (tipo || 'info');
    elMsgD.textContent = texto;
  }
  function nomeDe(cor) { return cor === 'w' ? nomeB : nomeP; }
  function corTxt(cor) { return cor === 'w' ? 'brancas' : 'pretas'; }
  function limpaNome(v, padrao) {
    v = String(v || '').replace(/\s+/g, ' ').trim();
    return v || padrao;
  }
  function travarTabuleiroD() { interD.bloqueado = fimD || !!aoConfirmar; }

  function atualizarQuemD() {
    var quem = $('#dupla-quem');
    quem.innerHTML = '';
    [['Brancas', nomeB], ['Pretas', nomeP]].forEach(function (par) {
      var sp = doc.createElement('span');
      sp.textContent = par[0] + ': ' + par[1];
      quem.appendChild(sp);
      quem.appendChild(doc.createTextNode(' '));
    });
    $('#dupla-desistir-b').textContent = 'Desistir (' + nomeB + ')';
    $('#dupla-desistir-p').textContent = 'Desistir (' + nomeP + ')';
  }

  function atualizarLancesD() {
    var h = jogoD.history();
    var partes = [];
    for (var i = 0; i < h.length; i += 2) {
      var n = i / 2 + 1;
      partes.push(n + '. ' + L.sanPt(h[i]) + (h[i + 1] ? ' ' + L.sanPt(h[i + 1]) : ''));
    }
    var caixa = $('#dupla-lances');
    caixa.textContent = partes.length ? partes.join('   ') : 'Nenhum lance ainda.';
    caixa.scrollTop = caixa.scrollHeight;
  }

  function textoVezD() {
    var cor = jogoD.turn();
    return 'Vez de ' + nomeDe(cor) + ' (' + corTxt(cor) + ').' + (jogoD.isCheck() ? ' Xeque!' : '');
  }

  function ajustarGiroD() {
    if (giro === 'girar' && !fimD) tabD.definirOrientacao(jogoD.turn());
  }

  function verificarFimD() {
    var r = L.resultadoPartida(jogoD);
    if (!r.fim) return false;
    fimD = true; fimManual = false;
    travarTabuleiroD();
    interD.sel = null; interD.alvos = [];
    interD.redesenhar();
    if (r.vencedor) msgD('🎉 Xeque-mate! ' + nomeDe(r.vencedor) + ' (' + corTxt(r.vencedor) + ') venceu a partida!', 'ok');
    else msgD(r.texto, 'info');
    return true;
  }

  function aoMoverDupla() {
    atualizarLancesD();
    if (verificarFimD()) return;
    msgD(textoVezD(), 'info');
    ajustarGiroD();
  }

  function fecharConfirmacao() {
    aoConfirmar = null;
    $('#dupla-confirma').hidden = true;
    travarTabuleiroD();
  }

  function perguntar(texto, aoSim) {
    aoConfirmar = aoSim;
    $('#dupla-confirma-texto').textContent = texto;
    $('#dupla-confirma').hidden = false;
    travarTabuleiroD();
    $('#dupla-confirma-nao').focus();
  }

  function encerrarManual(texto, tipo) {
    fimD = true; fimManual = true;
    travarTabuleiroD();
    interD.sel = null; interD.alvos = [];
    interD.redesenhar();
    msgD(texto, tipo);
  }

  function iniciarPartidaD() {
    jogoD = L.novoJogo();
    fimD = false; fimManual = false;
    fecharConfirmacao();
    tabD.definirOrientacao('w');
    interD.definirJogo(jogoD);
    interD.bloqueado = false;
    $('#dupla-opcoes').hidden = true;
    $('#dupla-area').hidden = false;
    atualizarQuemD();
    atualizarLancesD();
    msgD('A partida começou! ' + textoVezD(), 'info');
  }

  $('#dupla-comecar').addEventListener('click', function () {
    nomeB = limpaNome($('#dupla-nome-b').value, 'Brancas');
    nomeP = limpaNome($('#dupla-nome-p').value, 'Pretas');
    giro = $('input[name="dupla-giro"]:checked').value;
    iniciarPartidaD();
  });

  $('#dupla-nova').addEventListener('click', function () {
    jogoD = null;
    fimD = false;
    fecharConfirmacao();
    $('#dupla-area').hidden = true;
    $('#dupla-opcoes').hidden = false;
    $('#dupla-nome-b').focus();
  });

  $('#dupla-revanche').addEventListener('click', function () {
    var t = nomeB; nomeB = nomeP; nomeP = t;
    $('#dupla-nome-b').value = nomeB === 'Brancas' ? '' : nomeB;
    $('#dupla-nome-p').value = nomeP === 'Pretas' ? '' : nomeP;
    iniciarPartidaD();
  });

  $('#dupla-virar').addEventListener('click', function () { tabD.virar(); interD.redesenhar(); });

  $('#dupla-desfazer').addEventListener('click', function () {
    if (!jogoD || aoConfirmar) return;
    if (fimManual) {                       // reabre a partida sem mexer nas peças
      fimD = false; fimManual = false; travarTabuleiroD();
      msgD('Partida reaberta. ' + textoVezD(), 'info');
      return;
    }
    if (!jogoD.history().length) return;
    jogoD.undo();
    fimD = false;
    travarTabuleiroD();
    interD.ultimo = null; interD.sel = null; interD.alvos = []; interD.dica = null;
    interD.redesenhar();
    atualizarLancesD();
    ajustarGiroD();
    msgD('Lance desfeito. ' + textoVezD(), 'info');
  });

  function desistir(cor) {
    if (!jogoD || fimD || aoConfirmar) return;
    var outra = cor === 'w' ? 'b' : 'w';
    perguntar('Tem certeza de que ' + nomeDe(cor) + ' quer desistir?', function () {
      encerrarManual(nomeDe(cor) + ' desistiu. ' + nomeDe(outra) + ' (' + corTxt(outra) + ') venceu a partida!', 'ok');
    });
  }
  $('#dupla-desistir-b').addEventListener('click', function () { desistir('w'); });
  $('#dupla-desistir-p').addEventListener('click', function () { desistir('b'); });

  $('#dupla-empate').addEventListener('click', function () {
    if (!jogoD || fimD || aoConfirmar) return;
    perguntar(nomeB + ' e ' + nomeP + ' combinaram o empate?', function () {
      encerrarManual('Empate combinado entre ' + nomeB + ' e ' + nomeP + '.', 'info');
    });
  });

  $('#dupla-confirma-sim').addEventListener('click', function () {
    var f = aoConfirmar;
    fecharConfirmacao();
    if (f) f();
  });
  $('#dupla-confirma-nao').addEventListener('click', function () {
    fecharConfirmacao();
    msgD('Tudo bem, a partida continua. ' + textoVezD(), 'info');
  });

  // =========================================================== início
  desenharCategorias();
  carregar(0);
})(window);
