/*
 * regras.js — exemplos interativos da página "Regras e como jogar".
 * Cada exemplo é um mini tabuleiro: a pessoa toca na peça marcada, vê os
 * destinos possíveis e pode fazer um lance. "Recomeçar exemplo" volta ao início.
 */
(function (root) {
  'use strict';
  var XF = root.XF;
  var L = XF.logica;
  var doc = root.document;

  function iniciarEstatico(caixa) {
    var el = caixa.querySelector('[data-tab]');
    el.classList.add('pequeno');
    var tab = new XF.Tabuleiro(el, { rotulo: caixa.getAttribute('data-rotulo') || 'Exemplo' });
    var jogo = L.novoJogo(caixa.getAttribute('data-fen'));
    tab.desenhar(tab.estadoDe(jogo));
  }

  function textoDoLance(m) {
    if (m.flags.indexOf('k') >= 0) return 'Roque pequeno! O rei andou duas casas e a torre pulou para o outro lado.';
    if (m.flags.indexOf('q') >= 0) return 'Roque grande! O rei andou duas casas e a torre pulou para o outro lado.';
    if (m.flags.indexOf('e') >= 0) return 'En passant! Você capturou o peão "de passagem".';
    if (m.promotion) return 'Promoção! O peão virou ' + ({ q: 'dama', r: 'torre', b: 'bispo', n: 'cavalo' }[m.promotion]) + '.';
    if (m.captured) return 'Captura! Lance ' + L.sanPt(m.san) + '.';
    return 'Muito bem! Lance ' + L.sanPt(m.san) + '.';
  }

  function iniciarInterativo(caixa) {
    var fen = caixa.getAttribute('data-fen');
    var sel = caixa.getAttribute('data-selecione');
    var el = caixa.querySelector('[data-tab]');
    el.classList.add('pequeno');
    var msg = caixa.querySelector('.demo-msg');
    var reset = caixa.querySelector('.demo-reset');
    var tab = new XF.Tabuleiro(el, { rotulo: caixa.getAttribute('data-rotulo') || 'Exemplo' });
    var jogo = L.novoJogo(fen);
    var inter;

    function inicial() {
      msg.className = 'msg info demo-msg';
      msg.textContent = 'Toque na peça com moldura roxa para ver para onde ela pode ir. Depois toque numa casa marcada para mover.';
    }

    inter = new XF.Interacao(tab, jogo, {
      podeSelecionar: function (p, sq) { return sq === sel; },
      aoMover: function (m) {
        inter.bloqueado = true;
        msg.className = 'msg ok demo-msg';
        msg.textContent = textoDoLance(m) + ' Toque em "Recomeçar exemplo" para tentar de novo.';
      }
    });

    function recomecar() {
      jogo = L.novoJogo(fen);
      inter.definirJogo(jogo);
      inter.dica = [sel];
      inter.redesenhar();
      inicial();
    }

    reset.addEventListener('click', recomecar);
    tab.definirFoco(sel);
    inter.dica = [sel];
    inter.redesenhar();
    inicial();
  }

  doc.addEventListener('DOMContentLoaded', function () {
    XF.$$('.demo[data-estatico]').forEach(iniciarEstatico);
    XF.$$('.demo[data-demo]').forEach(iniciarInterativo);
  });
})(window);
