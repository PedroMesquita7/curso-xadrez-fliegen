/*
 * dados-aulas.js — conteúdo das "Aulas práticas".
 *
 * A trilha tem módulos; cada módulo tem aulas; cada aula tem exercícios.
 * Tipos de exercício:
 *   estrelas : mova suas peças para pegar as estrelas (★) e/ou capturar as peças pretas,
 *              que ficam paradas. Campos: pecas {casa: tipo}, fixas {casa: tipo} (peças
 *              brancas que só atrapalham o caminho), pretas {casa: tipo}, estrelas [casas].
 *   casa     : toque na casa certa. Campos: posicao (parte de peças de um FEN), resposta [casas].
 *   xadrez   : posição real (FEN), brancas jogam. Campo objetivo:
 *              xeque | mate | sair-xeque | afogar | roque | enpassant | seguro |
 *              captura-segura | lance (com solucoes ['de'+'para']) | linha (com passos).
 * Tipos de peça: k rei, q dama, r torre, b bispo, n cavalo, p peão.
 *
 * Depois de editar, abra verificar-problemas.html: ela confere se cada exercício tem solução.
 */
(function (root) {
  'use strict';
  var XF = root.XF = root.XF || {};

  XF.AULAS = [
    {
      id: 'pecas', titulo: 'As peças do xadrez',
      descricao: 'Conheça como cada peça se movimenta, pegando estrelas pelo tabuleiro.',
      aulas: [
        {
          id: 'torre', glifo: '♜', titulo: 'A torre', sub: 'Anda em linha reta',
          intro: 'A torre anda em linha reta: para frente, para trás e para os lados, quantas casas quiser, desde que o caminho esteja livre. Toque na torre e depois na casa da estrela.',
          exercicios: [
            { tipo: 'estrelas', pecas: { c2: 'r' }, estrelas: ['c7'], texto: 'Leve a torre até a estrela.' },
            { tipo: 'estrelas', pecas: { a1: 'r' }, estrelas: ['a6', 'f6'], texto: 'Pegue as duas estrelas.' },
            { tipo: 'estrelas', pecas: { h1: 'r' }, estrelas: ['h5', 'c5', 'c2', 'f2'], texto: 'Pegue todas as estrelas com o menor número de lances.' },
            { tipo: 'estrelas', pecas: { a1: 'r' }, fixas: { a4: 'p', d1: 'p' }, estrelas: ['b3', 'b8', 'g8'], texto: 'Os peões brancos atrapalham: a torre não pula por cima das peças.' }
          ]
        },
        {
          id: 'bispo', glifo: '♝', titulo: 'O bispo', sub: 'Anda nas diagonais',
          intro: 'O bispo anda na diagonal, quantas casas quiser. Repare: um bispo que começa numa casa escura fica sempre nas casas escuras, e o de casa clara, sempre nas claras.',
          exercicios: [
            { tipo: 'estrelas', pecas: { c1: 'b' }, estrelas: ['f4'], texto: 'Leve o bispo até a estrela.' },
            { tipo: 'estrelas', pecas: { f1: 'b' }, estrelas: ['c4', 'e6'], texto: 'Pegue as duas estrelas.' },
            { tipo: 'estrelas', pecas: { c1: 'b' }, estrelas: ['a3', 'd6', 'h2'], texto: 'Três estrelas, todas em casas escuras.' },
            { tipo: 'estrelas', pecas: { f1: 'b' }, fixas: { d3: 'p' }, estrelas: ['h3', 'c8'], texto: 'O peão bloqueia uma diagonal. Encontre outro caminho.' }
          ]
        },
        {
          id: 'dama', glifo: '♛', titulo: 'A dama', sub: 'Torre + bispo',
          intro: 'A dama é a peça mais forte: ela anda como a torre e como o bispo ao mesmo tempo, em linha reta ou na diagonal, quantas casas quiser.',
          exercicios: [
            { tipo: 'estrelas', pecas: { d1: 'q' }, estrelas: ['d7', 'h3'], texto: 'Use a linha reta e a diagonal.' },
            { tipo: 'estrelas', pecas: { a1: 'q' }, estrelas: ['c3', 'c7', 'g3'], texto: 'Pegue as três estrelas.' },
            { tipo: 'estrelas', pecas: { e4: 'q' }, estrelas: ['b1', 'b7', 'h7', 'h1'], texto: 'Quatro estrelas. Dá para pegar todas em quatro lances!' }
          ]
        },
        {
          id: 'rei', glifo: '♚', titulo: 'O rei', sub: 'A peça mais importante',
          intro: 'O rei anda só uma casa por vez, em qualquer direção. É a peça mais importante: quando ele é atacado e não tem como escapar, é xeque-mate e a partida acaba.',
          exercicios: [
            { tipo: 'estrelas', pecas: { e1: 'k' }, estrelas: ['e3'], texto: 'O rei anda uma casa por vez. Chegue até a estrela.' },
            { tipo: 'estrelas', pecas: { d4: 'k' }, estrelas: ['f6', 'b6'], texto: 'Pegue as duas estrelas. A diagonal ajuda!' },
            { tipo: 'estrelas', pecas: { a1: 'k' }, estrelas: ['c3', 'a5', 'd6'], texto: 'Planeje o caminho mais curto.' }
          ]
        },
        {
          id: 'cavalo', glifo: '♞', titulo: 'O cavalo', sub: 'Anda em L',
          intro: 'O cavalo anda em L: duas casas numa direção e uma para o lado. Ele é a única peça que pode pular por cima das outras!',
          exercicios: [
            { tipo: 'estrelas', pecas: { b1: 'n' }, estrelas: ['c3'], texto: 'Dê um salto em L até a estrela.' },
            { tipo: 'estrelas', pecas: { g1: 'n' }, estrelas: ['f3', 'e5', 'd7'], texto: 'Uma estrela por salto.' },
            { tipo: 'estrelas', pecas: { a1: 'n' }, estrelas: ['b3', 'd4', 'f5', 'h6'], texto: 'Atravesse o tabuleiro aos saltos.' },
            { tipo: 'estrelas', pecas: { g1: 'n' }, fixas: { e2: 'p', f2: 'p', g2: 'p', h2: 'p' }, estrelas: ['f3', 'h4'], texto: 'Os peões estão no caminho, mas o cavalo pula por cima!' }
          ]
        },
        {
          id: 'peao', glifo: '♟', titulo: 'O peão', sub: 'Só anda para frente',
          intro: 'O peão anda uma casa para frente e nunca volta. No primeiro lance de cada peão, ele pode andar duas casas. Para capturar, ele vai uma casa na diagonal, para frente. E quando chega ao fim do tabuleiro, vira outra peça: é a promoção!',
          exercicios: [
            { tipo: 'estrelas', pecas: { e2: 'p' }, estrelas: ['e4'], texto: 'No primeiro lance, o peão pode andar duas casas.' },
            { tipo: 'estrelas', pecas: { d2: 'p' }, estrelas: ['d3', 'd5'], texto: 'Cuidado: o peão não volta para trás!' },
            { tipo: 'estrelas', pecas: { d2: 'p' }, pretas: { c3: 'n', d5: 'b' }, texto: 'O peão captura na diagonal. Capture as duas peças pretas.' },
            { tipo: 'estrelas', pecas: { g7: 'p' }, estrelas: ['g8', 'a2'], texto: 'Leve o peão à última fileira: ele vira dama! Depois pegue a outra estrela.' }
          ]
        }
      ]
    },
    {
      id: 'fundamentos', titulo: 'Fundamentos',
      descricao: 'Capturar, defender, dar xeque e dar xeque-mate.',
      aulas: [
        {
          id: 'capturar', glifo: '✖', titulo: 'Capturar', sub: 'Pegue as peças do adversário',
          intro: 'Para capturar, leve sua peça até a casa de uma peça adversária: ela sai do tabuleiro. Aqui as peças pretas não se mexem. Capture todas!',
          exercicios: [
            { tipo: 'estrelas', pecas: { d1: 'r' }, pretas: { d6: 'b', h6: 'n' }, texto: 'Capture as duas peças pretas com a torre.' },
            { tipo: 'estrelas', pecas: { f1: 'b' }, pretas: { c4: 'p', a6: 'r' }, texto: 'Agora com o bispo.' },
            { tipo: 'estrelas', pecas: { d1: 'q', g1: 'n' }, pretas: { d7: 'p', f3: 'b', h5: 'n' }, texto: 'Use a dama e o cavalo para capturar tudo.' }
          ]
        },
        {
          id: 'defender', glifo: '♖', titulo: 'Defender', sub: 'Proteja suas peças',
          intro: 'Quando uma peça sua está sendo atacada e ninguém a protege, o adversário pode capturá-la de graça. Você pode tirá-la do ataque, protegê-la com outra peça ou capturar quem está atacando.',
          exercicios: [
            { tipo: 'xadrez', fen: '2r1k3/8/8/8/2B5/8/1P6/4K3 w - - 0 1', objetivo: 'seguro', texto: 'A torre preta ataca seu bispo. Deixe o bispo em segurança.' },
            { tipo: 'xadrez', fen: '6k1/1b6/8/8/4N3/8/3P1P2/6K1 w - - 0 1', objetivo: 'seguro', texto: 'O bispo preto ataca seu cavalo. Proteja-o ou tire-o do ataque.' },
            { tipo: 'xadrez', fen: '6k1/8/2n5/8/3R4/8/8/6K1 w - - 0 1', objetivo: 'seguro', texto: 'O cavalo preto ataca sua torre. Aqui não basta proteger: o cavalo vale menos que a torre. Fuja para uma casa segura!' }
          ]
        },
        {
          id: 'combate', glifo: '⚔', titulo: 'Combate', sub: 'Capture sem perder peças',
          intro: 'Antes de capturar, olhe se a peça adversária está protegida. Capturar uma peça protegida com uma peça que vale mais pode sair caro!',
          exercicios: [
            { tipo: 'xadrez', fen: '6k1/8/4p3/b2n4/8/8/3Q4/6K1 w - - 0 1', objetivo: 'captura-segura', texto: 'Capture uma peça preta sem perder a sua dama.' },
            { tipo: 'xadrez', fen: '4r1k1/8/1n6/8/8/8/1R2b3/7K w - - 0 1', objetivo: 'captura-segura', texto: 'Sua torre pode capturar duas peças. Qual delas está desprotegida?' }
          ]
        },
        {
          id: 'xeque', glifo: '✚', titulo: 'Xeque em 1', sub: 'Ataque o rei adversário',
          intro: 'Dar xeque é atacar o rei adversário. O rei nunca pode ficar em xeque: quem leva xeque é obrigado a se defender no lance seguinte.',
          exercicios: [
            { tipo: 'xadrez', fen: '4k3/8/8/8/8/8/8/R5K1 w - - 0 1', objetivo: 'xeque', texto: 'Dê xeque no rei preto com a torre.' },
            { tipo: 'xadrez', fen: '4k3/8/8/8/4N3/8/8/6K1 w - - 0 1', objetivo: 'xeque', texto: 'Agora dê xeque com o cavalo.' },
            { tipo: 'xadrez', fen: '4k3/8/8/8/8/8/8/5BK1 w - - 0 1', objetivo: 'xeque', texto: 'Agora com o bispo.' },
            { tipo: 'xadrez', fen: '4k3/3p1p2/8/8/8/8/8/3QK3 w - - 0 1', objetivo: 'xeque', texto: 'Os peões protegem o rei, mas existe um caminho livre para a dama.' }
          ]
        },
        {
          id: 'salve', glifo: '♔', titulo: 'Salve o rei', sub: 'Defenda-se do xeque',
          intro: 'Quando seu rei leva xeque, existem três saídas: fugir com o rei, bloquear o ataque colocando uma peça no caminho ou capturar a peça que está dando xeque.',
          exercicios: [
            { tipo: 'xadrez', fen: 'k3r3/8/8/8/8/8/8/4K3 w - - 0 1', objetivo: 'sair-xeque', texto: 'Seu rei está em xeque pela torre! Fuja.' },
            { tipo: 'xadrez', fen: '7k/8/8/8/2B5/8/5PPP/r5K1 w - - 0 1', objetivo: 'sair-xeque', texto: 'O rei não tem para onde fugir. Bloqueie o xeque!' },
            { tipo: 'xadrez', fen: '7k/8/8/8/8/3N4/5PPP/4r1K1 w - - 0 1', objetivo: 'sair-xeque', texto: 'Agora capture a peça que está dando xeque.' }
          ]
        },
        {
          id: 'mate1', glifo: '♚', titulo: 'Mate em 1', sub: 'Derrote o rei adversário',
          intro: 'Xeque-mate é quando o rei está em xeque e não tem nenhuma forma de se salvar: não pode fugir, bloquear nem capturar. Quem dá o xeque-mate vence a partida!',
          exercicios: [
            { tipo: 'xadrez', fen: 'k7/8/1K6/8/8/8/8/7R w - - 0 1', objetivo: 'mate', texto: 'Seu rei já prende o rei preto. Dê o xeque-mate com a torre.' },
            { tipo: 'xadrez', fen: '6k1/5ppp/8/8/8/8/8/3Q2K1 w - - 0 1', objetivo: 'mate', texto: 'O rei preto está preso atrás dos próprios peões.' },
            { tipo: 'xadrez', fen: 'k7/8/8/8/8/6K1/1R6/7R w - - 0 1', objetivo: 'mate', texto: 'Uma torre já fecha a coluna b. Use a outra!' }
          ]
        }
      ]
    },
    {
      id: 'intermediario', titulo: 'Intermediário',
      descricao: 'A posição inicial e os lances especiais.',
      aulas: [
        {
          id: 'posicao', glifo: '♙', titulo: 'Posição inicial', sub: 'Como o jogo começa',
          intro: 'O tabuleiro fica com uma casa clara no canto direito de cada jogador. As peças começam nas duas primeiras fileiras: torres nos cantos, depois cavalos e bispos; a dama fica sempre na casa da sua cor, e o rei, ao lado dela.',
          exercicios: [
            { tipo: 'casa', posicao: '8/8/8/8/8/8/8/8', resposta: ['h1'], texto: 'Toque na casa do canto direito, do seu lado do tabuleiro. Repare que ela é clara.' },
            { tipo: 'casa', posicao: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR', resposta: ['d1'], texto: 'Falta a dama branca! Toque na casa onde ela começa. Lembre: a dama fica na casa da sua cor.' },
            { tipo: 'casa', posicao: 'rnbq1bnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', resposta: ['e8'], texto: 'Falta o rei preto. Onde ele começa?' },
            { tipo: 'casa', posicao: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R1BQKB1R', resposta: ['b1', 'g1'], texto: 'Faltam os cavalos brancos. Toque numa das casas onde eles começam.' }
          ]
        },
        {
          id: 'roque', glifo: '♜', titulo: 'Roque', sub: 'O lance especial do rei',
          intro: 'No roque, o rei anda duas casas em direção a uma torre, e a torre pula para o outro lado dele. Só vale se o rei e a torre ainda não se mexeram, não há peças entre eles e o rei não está em xeque nem passa por uma casa atacada. Para fazer: toque no rei e depois na casa duas casas ao lado.',
          exercicios: [
            { tipo: 'xadrez', fen: '4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1', objetivo: 'roque', texto: 'Faça um roque: pequeno (para o lado do rei) ou grande (para o lado da dama).' },
            { tipo: 'xadrez', fen: '4k3/8/8/8/8/8/8/R3KB1R w KQ - 0 1', objetivo: 'roque', texto: 'O bispo está no caminho do roque pequeno. Faça o outro roque.' },
            { tipo: 'xadrez', fen: '4k3/8/8/8/2b5/8/8/R3K2R w KQ - 0 1', objetivo: 'roque', texto: 'O bispo preto ataca a casa f1, e o rei não pode passar por ela. Qual roque ainda é possível?' }
          ]
        },
        {
          id: 'enpassant', glifo: '♟', titulo: 'En passant', sub: 'O lance especial do peão',
          intro: 'Quando um peão adversário anda duas casas e para bem ao lado do seu peão, você pode capturá-lo como se ele tivesse andado só uma. Isso só vale no lance logo em seguida!',
          exercicios: [
            { tipo: 'xadrez', fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', objetivo: 'enpassant', texto: 'O peão preto acabou de andar de d7 para d5. Capture-o en passant: seu peão vai para d6.' },
            { tipo: 'xadrez', fen: '4k3/8/8/5Pp1/8/8/8/4K3 w - g6 0 1', objetivo: 'enpassant', texto: 'Agora o peão preto andou de g7 para g5. Capture en passant!' }
          ]
        },
        {
          id: 'afogado', glifo: '½', titulo: 'Rei afogado', sub: 'Quando o jogo empata',
          intro: 'Se o jogador da vez não tem nenhum lance permitido e o rei dele não está em xeque, o rei está afogado e a partida termina empatada. Cuidado para não afogar o rei adversário quando você está ganhando!',
          exercicios: [
            { tipo: 'xadrez', fen: 'k7/2K5/3Q4/8/8/8/8/8 w - - 0 1', objetivo: 'afogar', texto: 'Para entender: faça um lance que deixe o rei preto sem nenhum lance, mas sem xeque.' },
            { tipo: 'xadrez', fen: 'k7/8/1K6/8/8/8/8/3Q4 w - - 0 1', objetivo: 'mate', texto: 'Agora dê xeque-mate, sem afogar o rei!' }
          ]
        }
      ]
    },
    {
      id: 'taticas', titulo: 'Táticas',
      descricao: 'Valor das peças, garfo e cravada: jogadas para ganhar material.',
      aulas: [
        {
          id: 'valor', glifo: '⚖', titulo: 'Valor das peças', sub: 'Quanto vale cada peça',
          intro: 'Para decidir uma troca, usamos estes valores: peão = 1, cavalo = 3, bispo = 3, torre = 5 e dama = 9. O rei não tem valor, porque não pode ser perdido.',
          exercicios: [
            { tipo: 'xadrez', fen: '6k1/8/2r1p3/8/3N4/8/8/6K1 w - - 0 1', objetivo: 'lance', solucoes: ['d4c6'], acerto: 'Isso! A torre vale 5 e o peão só 1.', erro: 'Existe uma captura que vale mais. Compare os valores!', texto: 'Seu cavalo pode capturar duas peças. Escolha a que vale mais.' },
            { tipo: 'xadrez', fen: '5rk1/8/5q2/8/8/n7/1B6/6K1 w - - 0 1', objetivo: 'lance', solucoes: ['b2f6'], acerto: 'Ótima troca! Mesmo que a torre capture seu bispo, você trocou 3 por 9.', erro: 'Pense na troca: vale a pena dar um bispo (3) por uma dama (9)?', texto: 'O bispo pode capturar o cavalo (3) ou a dama (9), que está protegida pela torre. Qual é a melhor troca?' }
          ]
        },
        {
          id: 'garfo', glifo: '♞', titulo: 'Garfo', sub: 'Ataque duas peças de uma vez',
          intro: 'O garfo é quando uma peça ataca duas peças adversárias ao mesmo tempo. O adversário só consegue salvar uma delas! O cavalo é ótimo para garfos.',
          exercicios: [
            { tipo: 'xadrez', fen: 'r3k3/8/8/3N4/8/8/8/6K1 w - - 0 1', objetivo: 'linha',
              passos: [{ brancas: ['Nc7'], pretas: 'Kd7' }, { brancas: ['Nxa8'] }],
              texto: 'Dê um xeque com o cavalo que também ataque a torre. Depois capture-a.' },
            { tipo: 'xadrez', fen: '4k3/8/3n1b2/8/3PP3/8/8/4K3 w - - 0 1', objetivo: 'linha',
              passos: [{ brancas: ['e5'], pretas: 'Nb5' }, { brancas: ['exf6'] }],
              texto: 'Avance um peão para atacar o cavalo e o bispo ao mesmo tempo.' },
            { tipo: 'xadrez', fen: '7k/8/3Q4/8/8/6K1/8/r7 w - - 0 1', objetivo: 'linha',
              passos: [{ brancas: ['Qe5'], pretas: 'Kh7' }, { brancas: ['Qxa1'] }],
              texto: 'Com a dama, dê um xeque que também ataque a torre preta.' }
          ]
        },
        {
          id: 'cravada', glifo: '♝', titulo: 'Cravada', sub: 'Prenda a peça na frente do rei',
          intro: 'Na cravada, você ataca uma peça que está na frente de uma peça mais importante, como o rei. Se ela sair do lugar, deixa o rei exposto, e por isso fica presa!',
          exercicios: [
            { tipo: 'xadrez', fen: '4k3/8/2n5/8/8/8/8/4KB2 w - - 0 1', objetivo: 'lance', solucoes: ['f1b5'], acerto: 'Cravado! Se o cavalo sair da frente, o rei fica em xeque, então ele não pode se mexer.', erro: 'Procure a diagonal que passa pelo cavalo e chega ao rei.', texto: 'Crave o cavalo preto: coloque o bispo na mesma diagonal do cavalo e do rei.' },
            { tipo: 'xadrez', fen: '6k1/5r2/8/8/8/8/4B3/6K1 w - - 0 1', objetivo: 'lance', solucoes: ['e2c4'], acerto: 'Cravada! A torre não pode sair da frente do rei.', erro: 'A torre está na diagonal do rei preto. Qual casa do bispo ataca essa diagonal?', texto: 'Crave a torre preta contra o rei com o seu bispo.' }
          ]
        },
        {
          id: 'desafio', glifo: '★', titulo: 'Desafio: mate em 2', sub: 'Na página Treinar',
          link: 'treinar.html',
          intro: 'Pronto para o desafio? Na página Treinar há problemas de mate em 1 e mate em 2, e partidas contra o computador.'
        }
      ]
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
