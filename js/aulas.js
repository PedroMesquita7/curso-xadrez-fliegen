/*
 * aulas.js — página "Aulas práticas": trilha de aulas e exercícios no tabuleiro.
 * O conteúdo está em dados-aulas.js e as regras em aulas-motor.js.
 * O progresso fica salvo só neste aparelho (localStorage).
 */
(function (root) {
  'use strict';
  var XF = root.XF;
  var M = XF.aulasMotor;
  var L = XF.logica;
  var $ = XF.$;
  var doc = root.document;

  // ---------- lista linear das aulas (para "próxima aula") ----------
  var LISTA = [];
  XF.AULAS.forEach(function (mod, mi) {
    mod.aulas.forEach(function (a) { LISTA.push({ mod: mod, mi: mi, aula: a }); });
  });
  function acharAula(id) {
    for (var i = 0; i < LISTA.length; i++) if (LISTA[i].aula.id === id) return i;
    return -1;
  }

  // ---------- progresso ----------
  var prog = XF.ler('aulas', {});
  if (!prog || typeof prog !== 'object') prog = {};
  function progDe(id) { return prog[id] || { feitos: [] }; }
  function marcarFeito(id, i, total) {
    var p = progDe(id);
    if (p.feitos.indexOf(i) < 0) p.feitos.push(i);
    p.concluida = p.feitos.length >= total;
    prog[id] = p;
    XF.guardar('aulas', prog);
  }

  // =========================================================== trilha
  function desenharTrilha() {
    var alvo = $('#modulos');
    alvo.innerHTML = '';
    var total = 0, feitos = 0;
    XF.AULAS.forEach(function (mod, mi) {
      var sec = doc.createElement('section');
      sec.className = 'modulo';
      sec.setAttribute('aria-labelledby', 'mod-' + mod.id);
      var h2 = doc.createElement('h2');
      h2.id = 'mod-' + mod.id;
      h2.innerHTML = '<span class="mod-num">' + (mi + 1) + '</span>';
      h2.appendChild(doc.createTextNode(mod.titulo));
      sec.appendChild(h2);
      var d = doc.createElement('p');
      d.className = 'mod-desc';
      d.textContent = mod.descricao;
      sec.appendChild(d);
      var ul = doc.createElement('ul');
      ul.className = 'grade-aulas';
      mod.aulas.forEach(function (a) {
        var n = (a.exercicios || []).length;
        var p = progDe(a.id);
        var feitosA = Math.min(p.feitos.length, n);
        total += n; feitos += feitosA;
        var li = doc.createElement('li');
        var link = doc.createElement('a');
        link.className = 'cartao-aula' + (n && feitosA >= n ? ' concluida' : '') + (a.link ? ' desafio' : '');
        link.href = a.link ? a.link : '#' + a.id;
        var status = a.link ? 'Ir para Treinar →' : (feitosA >= n ? '✓ Concluída' : (feitosA ? feitosA + ' de ' + n + ' exercícios' : n + ' exercícios'));
        link.innerHTML =
          '<span class="glifo-aula" aria-hidden="true"></span>' +
          '<span class="txt-aula"><strong></strong><span class="sub-aula"></span><span class="status-aula"></span></span>';
        link.querySelector('.glifo-aula').textContent = a.glifo + '︎';
        link.querySelector('strong').textContent = a.titulo;
        link.querySelector('.sub-aula').textContent = a.sub;
        link.querySelector('.status-aula').textContent = status;
        if (n && !a.link) {
          var barra = doc.createElement('span');
          barra.className = 'mini-barra';
          barra.setAttribute('aria-hidden', 'true');
          barra.innerHTML = '<span style="width:' + Math.round(100 * feitosA / n) + '%"></span>';
          link.appendChild(barra);
        }
        li.appendChild(link);
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      alvo.appendChild(sec);
    });
    var pct = total ? Math.round(100 * feitos / total) : 0;
    $('#progresso-preenchido').style.width = pct + '%';
    $('#progresso-texto').textContent = feitos
      ? 'Você já fez ' + feitos + ' de ' + total + ' exercícios (' + pct + '%).'
      : 'São ' + LISTA.filter(function (x) { return !x.aula.link; }).length + ' aulas e ' + total + ' exercícios. Comece pela torre!';
  }

  // =========================================================== aula
  var tab = new XF.Tabuleiro($('#tab-aula'), { rotulo: 'Tabuleiro da aula' });
  var atual = null;      // item de LISTA
  var exIdx = 0;
  var ex = null;
  var timer = null;
  var feito = false;

  // estado dos modos
  var est = null, minimoEx = 0, lances = 0, selI = -1, alvos = [], ultimo = null, dica = null, travado = false; // estrelas
  var marcas = {}, pecasCasa = null;                                                                       // casa
  var jogo = null, inter = null, passo = 0, esperando = false, nivelDica = 0;                              // xadrez

  function msg(texto, tipo) {
    var el = $('#aula-msg');
    el.className = 'msg ' + (tipo || 'info');
    el.textContent = texto;
  }
  function limparTimer() { if (timer) { clearTimeout(timer); timer = null; } }

  function mostrar(qual) {
    $('#trilha').hidden = qual !== 'trilha';
    $('#licao').hidden = qual !== 'licao';
  }

  function abrirAula(idx) {
    limparTimer();
    atual = LISTA[idx];
    var a = atual.aula;
    $('#licao-modulo').textContent = 'Módulo ' + (atual.mi + 1) + ' · ' + atual.mod.titulo;
    $('#licao-titulo').textContent = a.titulo;
    $('#licao-intro').textContent = a.intro;
    doc.title = a.titulo + ' — Aulas práticas — Curso de Xadrez Fliegen';
    mostrar('licao');
    // começa no primeiro exercício ainda não feito
    var p = progDe(a.id), ini = 0;
    while (ini < a.exercicios.length && p.feitos.indexOf(ini) >= 0) ini++;
    if (ini >= a.exercicios.length) ini = 0;
    carregar(ini);
    root.scrollTo(0, 0);
    var t = $('#licao-titulo');
    t.tabIndex = -1;
    t.focus({ preventScroll: true });
  }

  function desenharPontos() {
    var ol = $('#exercicio-pontos');
    ol.innerHTML = '';
    var p = progDe(atual.aula.id);
    atual.aula.exercicios.forEach(function (e, i) {
      var li = doc.createElement('li');
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'ponto' + (p.feitos.indexOf(i) >= 0 ? ' feito' : '') + (i === exIdx ? ' atual' : '');
      b.textContent = String(i + 1);
      b.setAttribute('aria-label', 'Exercício ' + (i + 1) + (p.feitos.indexOf(i) >= 0 ? ', feito' : ''));
      if (i === exIdx) b.setAttribute('aria-current', 'step');
      b.addEventListener('click', function () { carregar(i); });
      li.appendChild(b);
      ol.appendChild(li);
    });
  }

  function carregar(i) {
    limparTimer();
    exIdx = i;
    ex = atual.aula.exercicios[i];
    feito = false;
    nivelDica = 0;
    $('#exercicio-num').textContent = 'Exercício ' + (i + 1) + ' de ' + atual.aula.exercicios.length;
    $('#exercicio-texto').textContent = ex.texto;
    $('#aula-proximo').hidden = true;
    $('#aula-fim').hidden = true;
    $('#aula-dica').disabled = false;
    desenharPontos();
    if (inter) { inter._fecharPromocao(); inter.bloqueado = true; }
    travado = false; dica = null;
    if (ex.tipo === 'estrelas') iniciarEstrelas();
    else if (ex.tipo === 'casa') iniciarCasa();
    else iniciarXadrez();
  }

  // ---------------------------------------------------------------- estrelas
  function iniciarEstrelas() {
    est = M.estadoInicial(ex);
    minimoEx = M.minimo(est);
    lances = 0; selI = -1; alvos = []; ultimo = null; dica = null; travado = false;
    tab.aoClicar = clicarEstrela;
    $('#tab-legenda').textContent = 'Toque na peça e depois numa casa marcada.';
    var temEstrela = Object.keys(est.estrelas).length > 0;
    msg((temEstrela ? 'Pegue todas as estrelas. ' : 'Capture todas as peças pretas. ') + 'O melhor caminho usa ' + minimoEx + ' lance' + (minimoEx > 1 ? 's' : '') + '.');
    var prim = est.brancas.filter(function (p) { return !p.fixa; })[0];
    if (prim) tab.definirFoco(prim.sq);
    desenharEstrelas();
  }

  function desenharEstrelas() {
    tab.desenhar({
      pecas: M.pecasParaDesenho(est),
      estrelas: Object.keys(est.estrelas),
      selecionada: selI >= 0 ? est.brancas[selI].sq : null,
      alvos: alvos,
      ultimo: ultimo,
      dica: dica
    });
  }

  function clicarEstrela(sq) {
    if (travado || feito) return;
    if (selI >= 0 && alvos.some(function (a) { return a.to === sq; })) { moverEstrela(sq); return; }
    var i = M.brancaEm(est, sq);
    if (i >= 0 && est.brancas[i].fixa) {
      selI = -1; alvos = [];
      msg('Esse peão só está aí para atrapalhar o caminho. Mova a outra peça.');
    } else if (i >= 0 && i !== selI) {
      selI = i;
      alvos = M.destinos(est, i);
      if (!alvos.length) msg('Essa peça não tem para onde ir agora.');
    } else {
      selI = -1; alvos = [];
    }
    desenharEstrelas();
  }

  function moverEstrela(para) {
    var de = est.brancas[selI].sq;
    var info = M.mover(est, selI, para);
    est = info.est;
    lances++;
    ultimo = { from: de, to: para };
    selI = -1; alvos = []; dica = null; nivelDica = 0;
    desenharEstrelas();
    var falta = M.faltam(est);
    if (!falta) {
      if (lances <= minimoEx) concluir('Perfeito! Você terminou em ' + lances + ' lance' + (lances > 1 ? 's' : '') + ', o menor número possível.', true);
      else concluir('Concluído em ' + lances + ' lances! Dá para fazer em ' + minimoEx + '. Quer tentar de novo? Toque em "Recomeçar".', false);
      return;
    }
    if (M.minimo(est) < 0) {
      travado = true;
      msg('Ops! Assim não dá mais para pegar tudo' + (info.est.brancas.some(function (p) { return p.t === 'p'; }) ? ' (o peão não volta para trás)' : '') + '. Vamos recomeçar.', 'erro');
      timer = setTimeout(iniciarEstrelas, 2200);
      return;
    }
    var resto = 'Falta' + (falta > 1 ? 'm ' : ' ') + falta + '.';
    if (info.promoveu) msg('Promoção! O peão chegou ao fim e virou dama. ' + resto, 'ok');
    else if (info.estrela) msg('Estrela! ' + resto + ' Lances: ' + lances + '.', 'ok');
    else if (info.capturou) msg('Captura! ' + resto + ' Lances: ' + lances + '.', 'ok');
    else msg('Lances: ' + lances + '. ' + resto);
  }

  function dicaEstrelas() {
    var m = M.melhorLance(est);
    if (!m) return;
    nivelDica++;
    if (nivelDica === 1) { dica = [m.from]; msg('Dica: comece movendo a peça destacada.'); }
    else { dica = [m.from, m.to]; msg('Dica: leve a peça destacada para a outra casa destacada.'); }
    desenharEstrelas();
  }

  // ---------------------------------------------------------------- casa
  function iniciarCasa() {
    marcas = {};
    pecasCasa = M.pecasDaPosicao(ex.posicao);
    tab.aoClicar = clicarCasa;
    $('#tab-legenda').textContent = 'Toque na casa da resposta.';
    msg('Toque na casa certa no tabuleiro.');
    tab.definirFoco('e2');
    desenharCasa();
  }
  function desenharCasa() { tab.desenhar({ pecas: pecasCasa, marcas: marcas, dica: dica }); }
  function clicarCasa(sq) {
    if (feito || travado) return;
    if (ex.resposta.indexOf(sq) >= 0) {
      marcas = {}; marcas[sq] = 'certa'; dica = null;
      desenharCasa();
      concluir('Isso mesmo! A resposta é ' + sq + '.', true);
    } else {
      marcas = {}; marcas[sq] = 'errada';
      desenharCasa();
      msg('Não é a casa ' + sq + '. Tente de novo.', 'erro');
      timer = setTimeout(function () { marcas = {}; desenharCasa(); }, 900);
    }
  }
  function dicaCasa() {
    nivelDica++;
    var r = ex.resposta[0];
    if (nivelDica === 1) msg('Dica: a resposta está na fileira ' + r[1] + ' (contando de baixo para cima, do lado das brancas).');
    else { dica = [r]; msg('Dica: é a casa destacada.'); desenharCasa(); }
  }

  // ---------------------------------------------------------------- xadrez
  function iniciarXadrez() {
    jogo = M.novoJogo(ex.fen);
    passo = 0; esperando = false;
    inter = new XF.Interacao(tab, jogo, {
      podeSelecionar: function () { return !feito && !esperando; },
      aoMover: aoMoverXadrez
    });
    $('#tab-legenda').textContent = 'Você joga com as brancas. Toque na peça e depois na casa de destino.';
    msg(jogo.isCheck() ? 'Atenção: seu rei está em xeque!' : 'Você joga com as brancas.');
    var focado = false;
    jogo.board().forEach(function (linha) {
      linha.forEach(function (p) { if (!focado && p && p.color === 'w' && p.type !== 'k') { tab.definirFoco(p.square); focado = true; } });
    });
    inter.redesenhar();
  }

  function errado(texto) {
    esperando = true;
    inter.bloqueado = true;
    msg(texto, 'erro');
    timer = setTimeout(function () {
      jogo.undo();
      inter.ultimo = null;
      inter.bloqueado = false;
      esperando = false;
      inter.redesenhar();
    }, 1300);
  }

  function aoMoverXadrez(m) {
    nivelDica = 0; inter.dica = null;
    if (ex.objetivo === 'linha') {
      var p = ex.passos[passo];
      var ok = p.brancas.some(function (b) { return M.semSinais(b) === M.semSinais(m.san); });
      if (!ok) { errado('Não é esse lance. Tente de novo.'); return; }
      if (!p.pretas) { concluir(ex.acerto || 'Perfeito! A tática funcionou e você ganhou material.', true); return; }
      esperando = true;
      inter.bloqueado = true;
      msg('Muito bem! Agora as pretas respondem...', 'ok');
      timer = setTimeout(function () {
        var r = jogo.move(p.pretas);
        inter.ultimo = { from: r.from, to: r.to };
        passo++;
        esperando = false;
        inter.bloqueado = false;
        inter.redesenhar();
        var fem = r.piece === 'q' || r.piece === 'r';
        msg((fem ? 'A ' : 'O ') + M.NOME[r.piece] + (fem ? ' preta' : ' preto') + ' foi para ' + r.to + '. Agora complete a jogada!');
      }, 800);
      return;
    }
    var res = M.avaliar(ex, jogo, m);
    if (res.ok) concluir(res.msg, true);
    else errado(res.msg);
  }

  function dicaXadrez() {
    var sols = M.solucoes(ex, jogo, passo);
    if (!sols.length) return;
    nivelDica++;
    var s = sols[0];
    if (nivelDica === 1) { inter.dica = [s.from]; msg('Dica: mova a peça destacada.'); }
    else { inter.dica = [s.from, s.to]; msg('Dica: leve a peça destacada para a outra casa destacada.'); }
    inter.redesenhar();
  }

  // ---------------------------------------------------------------- comum
  function concluir(texto, perfeito) {
    feito = true;
    if (inter && ex.tipo === 'xadrez') inter.bloqueado = true;
    var a = atual.aula, n = a.exercicios.length;
    marcarFeito(a.id, exIdx, n);
    msg(texto, 'ok');
    $('#aula-dica').disabled = true;
    desenharPontos();
    var p = progDe(a.id);
    var proximoNaoFeito = -1;
    for (var k = 1; k <= n; k++) {
      var j = (exIdx + k) % n;
      if (p.feitos.indexOf(j) < 0) { proximoNaoFeito = j; break; }
    }
    if (proximoNaoFeito < 0) {
      timer = setTimeout(mostrarFim, perfeito ? 900 : 0);
      return;
    }
    var btn = $('#aula-proximo');
    btn.hidden = false;
    btn.onclick = function () { carregar(proximoNaoFeito); };
    if (perfeito) timer = setTimeout(function () { carregar(proximoNaoFeito); }, 1800);
  }

  function mostrarFim() {
    var idx = acharAula(atual.aula.id);
    var prox = LISTA[idx + 1];
    $('#aula-fim').hidden = false;
    $('#aula-proximo').hidden = true;
    $('#aula-fim-texto').textContent = prox
      ? 'Você terminou "' + atual.aula.titulo + '". A próxima é: ' + prox.aula.titulo + '.'
      : 'Você terminou todas as aulas da trilha. Parabéns!';
    var seg = $('#aula-seguinte');
    seg.hidden = !prox;
    if (prox) {
      seg.textContent = (prox.aula.link ? prox.aula.titulo : 'Próxima aula: ' + prox.aula.titulo) + ' →';
      seg.onclick = function () {
        if (prox.aula.link) root.location.href = prox.aula.link;
        else root.location.hash = prox.aula.id;
      };
    }
    seg.focus({ preventScroll: true });
  }

  $('#aula-dica').addEventListener('click', function () {
    if (feito) return;
    limparTimer();
    if (ex.tipo === 'estrelas') dicaEstrelas();
    else if (ex.tipo === 'casa') dicaCasa();
    else if (!esperando) dicaXadrez();
  });
  $('#aula-recomecar').addEventListener('click', function () { carregar(exIdx); });
  $('#aula-repetir').addEventListener('click', function () { carregar(0); });
  $('#voltar-trilha').addEventListener('click', function () { root.location.hash = ''; });

  // apagar progresso (com confirmação na própria página)
  var zerar = $('#zerar-progresso'), zerarTimer = null;
  zerar.addEventListener('click', function () {
    if (zerar.getAttribute('data-confirmar') === '1') {
      prog = {};
      XF.guardar('aulas', prog);
      zerar.removeAttribute('data-confirmar');
      zerar.textContent = 'Apagar meu progresso';
      desenharTrilha();
      return;
    }
    zerar.setAttribute('data-confirmar', '1');
    zerar.textContent = 'Toque de novo para confirmar';
    clearTimeout(zerarTimer);
    zerarTimer = setTimeout(function () { zerar.removeAttribute('data-confirmar'); zerar.textContent = 'Apagar meu progresso'; }, 4000);
  });

  // =========================================================== rotas (#torre, #bispo...)
  function rota() {
    var id = decodeURIComponent((root.location.hash || '').slice(1));
    var idx = acharAula(id);
    if (idx >= 0 && !LISTA[idx].aula.link) {
      abrirAula(idx);
    } else {
      limparTimer();
      doc.title = 'Aulas práticas — Curso de Xadrez Fliegen';
      desenharTrilha();
      mostrar('trilha');
    }
  }
  root.addEventListener('hashchange', function () { rota(); if (!root.location.hash) root.scrollTo(0, 0); });
  rota();
})(window);
