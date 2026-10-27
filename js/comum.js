/*
 * comum.js — acessibilidade (tamanho do texto, alto contraste) e utilitários.
 * As preferências ficam salvas só no próprio aparelho (localStorage).
 */
(function (root) {
  'use strict';
  var XF = root.XF = root.XF || {};
  var doc = root.document;

  // ---------- armazenamento local (nunca quebra o site se estiver bloqueado) ----------
  XF.guardar = function (chave, valor) {
    try { root.localStorage.setItem('xf_' + chave, JSON.stringify(valor)); } catch (e) { /* ignora */ }
  };
  XF.ler = function (chave, padrao) {
    try {
      var v = root.localStorage.getItem('xf_' + chave);
      return v === null ? padrao : JSON.parse(v);
    } catch (e) { return padrao; }
  };

  XF.$ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  XF.$$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  XF.anunciar = function (el, texto) { if (el) el.textContent = texto; };

  // ---------- acessibilidade ----------
  var NIVEIS = [90, 100, 112, 125, 140, 160];

  function aplicarTexto(i) {
    doc.documentElement.style.fontSize = NIVEIS[i] + '%';
    XF.guardar('texto', i);
  }
  function aplicarContraste(ligado) {
    if (ligado) doc.documentElement.setAttribute('data-contraste', 'alto');
    else doc.documentElement.removeAttribute('data-contraste');
    XF.guardar('contraste', !!ligado);
  }

  function montarBarra() {
    var alvo = XF.$('#barra-acess');
    if (!alvo) return;
    var nivel = XF.ler('texto', 1);
    if (nivel < 0 || nivel >= NIVEIS.length) nivel = 1;
    var contraste = !!XF.ler('contraste', false);

    alvo.setAttribute('role', 'region');
    alvo.setAttribute('aria-label', 'Opções de acessibilidade');
    alvo.innerHTML =
      '<span class="barra-titulo">Acessibilidade:</span>' +
      '<button type="button" class="btn-mini" id="txt-menos" aria-label="Diminuir o tamanho do texto">A−</button>' +
      '<button type="button" class="btn-mini" id="txt-mais" aria-label="Aumentar o tamanho do texto">A+</button>' +
      '<button type="button" class="btn-mini" id="btn-contraste" aria-pressed="' + contraste + '">Alto contraste</button>';

    function atualizarEstadoBotoes() {
      XF.$('#txt-menos').disabled = nivel === 0;
      XF.$('#txt-mais').disabled = nivel === NIVEIS.length - 1;
    }
    XF.$('#txt-menos').addEventListener('click', function () { if (nivel > 0) { nivel--; aplicarTexto(nivel); atualizarEstadoBotoes(); } });
    XF.$('#txt-mais').addEventListener('click', function () { if (nivel < NIVEIS.length - 1) { nivel++; aplicarTexto(nivel); atualizarEstadoBotoes(); } });
    XF.$('#btn-contraste').addEventListener('click', function (e) {
      contraste = !contraste;
      e.currentTarget.setAttribute('aria-pressed', String(contraste));
      aplicarContraste(contraste);
    });
    atualizarEstadoBotoes();
  }

  function marcarPaginaAtual() {
    var atual = (root.location.pathname.split('/').pop() || 'index.html');
    if (atual === '') atual = 'index.html';
    XF.$$('.menu a').forEach(function (a) {
      var destino = a.getAttribute('href');
      if (destino === atual) a.setAttribute('aria-current', 'page');
    });
  }

  // Aplica as preferências o mais cedo possível (evita "piscar")
  aplicarTexto(Math.min(Math.max(XF.ler('texto', 1), 0), NIVEIS.length - 1));
  if (XF.ler('contraste', false)) doc.documentElement.setAttribute('data-contraste', 'alto');

  doc.addEventListener('DOMContentLoaded', function () {
    montarBarra();
    marcarPaginaAtual();
  });
})(window);
