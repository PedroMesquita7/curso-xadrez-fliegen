/*
 * tabuleiro.js — tabuleiro de xadrez acessível.
 *  - Tabuleiro: só desenha (casas são botões; funciona com toque, mouse e teclado).
 *  - Interacao: seleciona peça, mostra destinos possíveis e executa o lance.
 * Para mover: toque/clique na peça e depois na casa de destino.
 */
(function (root) {
  'use strict';
  var XF = root.XF = root.XF || {};
  var doc = root.document;

  var ARQUIVOS = 'abcdefgh';
  // Peças "cheias" para os dois lados; a cor vem do CSS. \uFE0E evita virar emoji.
  var GLIFOS = { k: '\u265A', q: '\u265B', r: '\u265C', b: '\u265D', n: '\u265E', p: '\u265F' };

  // ---------------------------------------------------------------- Tabuleiro
  function Tabuleiro(el, op) {
    this.el = el;
    this.op = op || {};
    this.orient = this.op.orientacao || 'w';
    this.casas = {};
    this.focoSq = null;
    this.aoClicar = null;
    el.classList.add('tabuleiro');
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', this.op.rotulo || 'Tabuleiro de xadrez');
    this._construir();
    var self = this;
    el.addEventListener('keydown', function (e) { self._teclado(e); });
  }

  Tabuleiro.prototype._construir = function () {
    var self = this;
    this.el.innerHTML = '';
    this.casas = {};
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var rank = this.orient === 'w' ? 8 - i : i + 1;
        var file = this.orient === 'w' ? j : 7 - j;
        var sq = ARQUIVOS[file] + rank;
        var clara = (file + rank) % 2 === 0; // a1 é escura
        var b = doc.createElement('button');
        b.type = 'button';
        b.className = 'casa ' + (clara ? 'clara' : 'escura');
        b.setAttribute('data-sq', sq);
        b.tabIndex = -1;
        var peca = doc.createElement('span');
        peca.className = 'peca';
        peca.setAttribute('aria-hidden', 'true');
        b.appendChild(peca);
        if (this.op.coordenadas !== false) {
          if (j === 0) { var cr = doc.createElement('span'); cr.className = 'coord fil'; cr.setAttribute('aria-hidden', 'true'); cr.textContent = String(rank); b.appendChild(cr); }
          if (i === 7) { var ca = doc.createElement('span'); ca.className = 'coord arq'; ca.setAttribute('aria-hidden', 'true'); ca.textContent = ARQUIVOS[file]; b.appendChild(ca); }
        }
        (function (s) {
          b.addEventListener('click', function () { self.focoSq = s; self._ajustarTab(); if (self.aoClicar) self.aoClicar(s); });
        })(sq);
        this.el.appendChild(b);
        this.casas[sq] = { el: b, peca: peca, clara: clara };
      }
    }
    this.focoSq = this.focoSq || (this.orient === 'w' ? 'e2' : 'e7');
    this._ajustarTab();
  };

  // Só uma casa entra na sequência do Tab (as setas movem o foco dentro do tabuleiro)
  Tabuleiro.prototype._ajustarTab = function () {
    for (var sq in this.casas) this.casas[sq].el.tabIndex = (sq === this.focoSq ? 0 : -1);
  };

  Tabuleiro.prototype._teclado = function (e) {
    var alvo = e.target.closest ? e.target.closest('.casa') : null;
    if (!alvo) return;
    var sq = alvo.getAttribute('data-sq');
    var arq = ARQUIVOS.indexOf(sq[0]);
    var fil = parseInt(sq[1], 10);
    var dx = 0, dy = 0;
    if (e.key === 'ArrowRight') dx = 1; else if (e.key === 'ArrowLeft') dx = -1;
    else if (e.key === 'ArrowUp') dy = 1; else if (e.key === 'ArrowDown') dy = -1;
    else return;
    if (this.orient === 'b') { dx = -dx; dy = -dy; } // setas seguem o que se vê na tela
    var na = arq + dx, nf = fil + dy;
    if (na < 0 || na > 7 || nf < 1 || nf > 8) { e.preventDefault(); return; }
    e.preventDefault();
    this.focarCasa(ARQUIVOS[na] + nf);
  };

  // Define qual casa recebe o foco ao apertar Tab (sem mover o foco agora)
  Tabuleiro.prototype.definirFoco = function (sq) {
    if (!this.casas[sq]) return;
    this.focoSq = sq;
    this._ajustarTab();
  };

  Tabuleiro.prototype.focarCasa = function (sq) {
    if (!this.casas[sq]) return;
    this.focoSq = sq;
    this._ajustarTab();
    this.casas[sq].el.focus();
  };

  Tabuleiro.prototype.definirOrientacao = function (o) {
    if (o === this.orient) return;
    this.orient = o;
    this.focoSq = o === 'w' ? 'e2' : 'e7';
    this._construir();
    if (this._ultimoEstado) this.desenhar(this._ultimoEstado);
  };

  Tabuleiro.prototype.virar = function () { this.definirOrientacao(this.orient === 'w' ? 'b' : 'w'); };

  // Posição do rei que está em xeque (ou null)
  Tabuleiro.prototype.estadoDe = function (jogo) {
    var xeque = null;
    if (jogo.isCheck()) {
      var tab = jogo.board();
      for (var r = 0; r < 8; r++) for (var f = 0; f < 8; f++) {
        var p = tab[r][f];
        if (p && p.type === 'k' && p.color === jogo.turn()) xeque = p.square;
      }
    }
    return { pecas: jogo.board(), xeque: xeque };
  };

  // estado: { pecas, selecionada, alvos:[{to,captura}], ultimo:{from,to}, xeque, dica:[sq,...] }
  Tabuleiro.prototype.desenhar = function (estado) {
    this._ultimoEstado = estado;
    var mapa = {};
    (estado.pecas || []).forEach(function (linha) { linha.forEach(function (p) { if (p) mapa[p.square] = p; }); });
    var alvos = {};
    (estado.alvos || []).forEach(function (a) { alvos[a.to] = a; });
    var dicas = {};
    (estado.dica || []).forEach(function (s) { dicas[s] = true; });
    var ult = estado.ultimo || {};
    var estrelas = {};
    (estado.estrelas || []).forEach(function (s) { estrelas[s] = true; });
    var marcas = estado.marcas || {};

    for (var sq in this.casas) {
      var c = this.casas[sq];
      var p = mapa[sq];
      var cls = 'casa ' + (c.clara ? 'clara' : 'escura');
      var extras = [];
      if (estado.selecionada === sq) { cls += ' sel'; extras.push('selecionada'); }
      if (alvos[sq]) {
        cls += ' alvo' + (alvos[sq].captura ? ' captura' : '');
        extras.push(alvos[sq].captura ? 'captura possível' : 'destino possível');
      }
      if (ult.from === sq || ult.to === sq) cls += ' ultimo';
      if (estado.xeque === sq) { cls += ' xeque'; extras.push('rei em xeque'); }
      if (dicas[sq]) { cls += ' dica'; extras.push('dica'); }
      if (marcas[sq] === 'certa') { cls += ' marca-certa'; extras.push('resposta certa'); }
      if (marcas[sq] === 'errada') { cls += ' marca-errada'; extras.push('resposta errada'); }
      c.el.className = cls;

      if (p) {
        c.peca.textContent = GLIFOS[p.type] + '\uFE0E';
        c.peca.className = 'peca ' + (p.color === 'w' ? 'b' : 'p');
      } else if (estrelas[sq]) {
        c.peca.textContent = '\u2605';
        c.peca.className = 'peca estrela';
      } else {
        c.peca.textContent = '';
        c.peca.className = 'peca';
      }
      var nome = p ? XF.logica.nomePeca(p.type, p.color) : (estrelas[sq] ? 'estrela' : 'casa vazia');
      c.el.setAttribute('aria-label', sq + ', ' + nome + (extras.length ? ', ' + extras.join(', ') : ''));
    }
  };

  // ---------------------------------------------------------------- Interacao
  function Interacao(tab, jogo, op) {
    this.tab = tab;
    this.jogo = jogo;
    this.op = op || {};
    this.sel = null;
    this.alvos = [];
    this.ultimo = null;
    this.dica = null;
    this.bloqueado = false;
    this.painelPromocao = null;
    var self = this;
    tab.aoClicar = function (sq) { self.clicar(sq); };
  }

  Interacao.prototype.definirJogo = function (jogo) { this.jogo = jogo; this.limpar(); };

  Interacao.prototype.limpar = function () {
    this.sel = null; this.alvos = []; this.ultimo = null; this.dica = null;
    this.bloqueado = false;
    this._fecharPromocao();
    this.redesenhar();
  };

  Interacao.prototype.redesenhar = function () {
    var base = this.tab.estadoDe(this.jogo);
    base.selecionada = this.sel;
    base.alvos = this.alvos;
    base.ultimo = this.ultimo;
    base.dica = this.dica;
    this.tab.desenhar(base);
  };

  Interacao.prototype.clicar = function (sq) {
    if (this.bloqueado) return;
    var jogo = this.jogo;
    if (this.sel && this.alvos.some(function (a) { return a.to === sq; })) {
      this._tentarMover(this.sel, sq);
      return;
    }
    if (sq === this.sel) { this.sel = null; this.alvos = []; this.redesenhar(); return; }
    var p = jogo.get(sq);
    var pode = p && p.color === jogo.turn() && (!this.op.podeSelecionar || this.op.podeSelecionar(p, sq));
    if (pode) {
      this.sel = sq;
      this.alvos = jogo.moves({ square: sq, verbose: true }).map(function (m) {
        return { to: m.to, captura: !!m.captured || (m.flags && m.flags.indexOf('e') >= 0) };
      });
      this.dica = null;
    } else {
      this.sel = null; this.alvos = [];
    }
    this.redesenhar();
  };

  Interacao.prototype._tentarMover = function (de, para) {
    var candidatos = this.jogo.moves({ square: de, verbose: true }).filter(function (m) { return m.to === para; });
    if (!candidatos.length) return;
    if (candidatos[0].promotion) this._pedirPromocao(candidatos);
    else this._executar(candidatos[0]);
  };

  Interacao.prototype._executar = function (m) {
    var feito = this.jogo.move({ from: m.from, to: m.to, promotion: m.promotion });
    this.sel = null; this.alvos = []; this.dica = null;
    this.ultimo = { from: feito.from, to: feito.to };
    this.redesenhar();
    if (this.op.aoMover) this.op.aoMover(feito);
  };

  // Jogada feita por fora (computador, resposta automática)
  Interacao.prototype.jogarLance = function (m) { this._executar(m); };

  Interacao.prototype._pedirPromocao = function (candidatos) {
    var self = this;
    this._fecharPromocao();
    this.bloqueado = true;
    var painel = doc.createElement('div');
    painel.className = 'promocao';
    painel.setAttribute('role', 'group');
    painel.setAttribute('aria-label', 'Escolha a peça para a promoção do peão');
    var titulo = doc.createElement('p');
    titulo.textContent = 'O peão chegou ao fim! Em qual peça ele vai se transformar?';
    painel.appendChild(titulo);
    var nomes = { q: 'Dama', r: 'Torre', b: 'Bispo', n: 'Cavalo' };
    ['q', 'r', 'b', 'n'].forEach(function (t) {
      var cand = candidatos.filter(function (m) { return m.promotion === t; })[0];
      if (!cand) return;
      var btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'btn';
      btn.textContent = nomes[t];
      btn.addEventListener('click', function () { self._fecharPromocao(); self.bloqueado = false; self._executar(cand); });
      painel.appendChild(btn);
    });
    var cancelar = doc.createElement('button');
    cancelar.type = 'button';
    cancelar.className = 'btn btn-sec';
    cancelar.textContent = 'Cancelar';
    cancelar.addEventListener('click', function () { self._fecharPromocao(); self.bloqueado = false; self.sel = null; self.alvos = []; self.redesenhar(); });
    painel.appendChild(cancelar);
    this.tab.el.insertAdjacentElement('afterend', painel);
    this.painelPromocao = painel;
    var primeiro = painel.querySelector('button');
    if (primeiro) primeiro.focus();
  };

  Interacao.prototype._fecharPromocao = function () {
    if (this.painelPromocao && this.painelPromocao.parentNode) this.painelPromocao.parentNode.removeChild(this.painelPromocao);
    this.painelPromocao = null;
  };

  XF.Tabuleiro = Tabuleiro;
  XF.Interacao = Interacao;
})(window);
