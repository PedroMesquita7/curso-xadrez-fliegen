/*
 * dados-problemas.js — problemas de treino.
 * Todas as posições foram verificadas por computador: cada problema tem solução,
 * é legal e (nos "mate em 2") não tem mate em 1. Para acrescentar um problema,
 * copie um bloco, troque a posição (FEN), o título e a dica.
 * O site descobre sozinho de quem é a vez e valida as respostas.
 */
(function (root) {
  'use strict';
  var XF = root.XF = root.XF || {};

  XF.PROBLEMAS = {
    mate1: {
      titulo: 'Mate em 1',
      descricao: 'Encontre o lance que dá xeque-mate.',
      lista: [
        { id: 'm1-01', titulo: 'Mate do corredor',
          fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
          dica: 'O rei preto está preso atrás dos próprios peões. Que lance da torre dá xeque sem deixar fuga?' },
        { id: 'm1-02', titulo: 'Dama e rei juntos',
          fen: '7k/8/6K1/8/8/8/Q7/8 w - - 0 1',
          dica: 'Seu rei já fecha as casas g7 e h7. A dama pode chegar à última linha em um só lance.' },
        { id: 'm1-03', titulo: 'Duas torres',
          fen: '7k/R7/8/8/8/8/1R6/6K1 w - - 0 1',
          dica: 'Uma torre já controla a sétima linha. Use a outra para dar xeque na oitava.' },
        { id: 'm1-04', titulo: 'Mate do sufocamento',
          fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
          dica: 'O rei está cercado pelas próprias peças. Só o cavalo consegue dar esse xeque.' },
        { id: 'm1-05', titulo: 'Mate do pastor',
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
          dica: 'O peão em f7 só é protegido pelo rei. Sua dama e seu bispo apontam para ele.' },
        { id: 'm1-06', titulo: 'Corredor, agora com as pretas',
          fen: 'r5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1',
          dica: 'Agora as pretas jogam! A torre pode entrar na primeira linha.' },
        { id: 'm1-07', titulo: 'Dama no canto',
          fen: 'k7/2Q5/1K6/8/8/8/8/8 w - - 0 1',
          dica: 'O rei preto está no canto. Qualquer xeque da dama protegido pelo seu rei resolve (há mais de uma resposta).' },
        { id: 'm1-08', titulo: 'O mate do louco',
          fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2',
          dica: 'As pretas jogam. A diagonal da dama até o rei branco está aberta.' },
        { id: 'm1-09', titulo: 'Torre e rei',
          fen: '7k/8/6K1/8/8/8/8/R7 w - - 0 1',
          dica: 'Seu rei já tira as casas g7 e h7. Falta a torre cuidar da última linha.' },
        { id: 'm1-10', titulo: 'Capture dando mate',
          fen: '3r2k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1',
          dica: 'Uma captura pode ser xeque-mate. Olhe para a torre preta sem proteção.' }
      ]
    },

    mate2: {
      titulo: 'Mate em 2',
      descricao: 'Dê um lance que obriga o rei a se mexer e, no lance seguinte, dê o mate.',
      lista: [
        { id: 'm2-01', titulo: 'Escada de torres (1)',
          fen: '7k/8/8/8/8/8/R7/1R4K1 w - - 0 1',
          dica: 'Use uma torre para fechar a sétima linha. O rei preto só terá uma casa. Depois, a outra torre dá o mate.' },
        { id: 'm2-02', titulo: 'Escada de torres (pretas)',
          fen: '7k/7r/8/8/8/5r2/8/K7 b - - 0 1',
          dica: 'Agora as pretas jogam. Feche uma linha com uma torre e deixe a outra para o xeque-mate.' },
        { id: 'm2-03', titulo: 'Corte o rei',
          fen: '8/8/3K4/8/8/k7/7R/7R w - - 0 1',
          dica: 'Nem todo bom lance é um xeque. Feche uma coluna inteira para o rei preto ficar sem espaço.' },
        { id: 'm2-04', titulo: 'Duas torres (pretas)',
          fen: '8/8/8/1r6/7r/8/8/k1K5 b - - 0 1',
          dica: 'Corte o rei branco com uma torre. Na jogada seguinte, a outra torre dá o mate.' },
        { id: 'm2-05', titulo: 'Dama que fecha a porta',
          fen: '8/8/6Q1/8/8/2K5/8/4k3 w - - 0 1',
          dica: 'Tire as casas de fuga do rei preto, mesmo sem dar xeque agora.' },
        { id: 'm2-06', titulo: 'Dama e rei contra rei',
          fen: '6Q1/8/8/7k/8/5K2/8/8 w - - 0 1',
          dica: 'Coloque a dama a um "pulo de cavalo" do rei preto. Ele não terá como fugir.' }
      ]
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
