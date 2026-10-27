# Curso de Xadrez Fliegen

Curso gratuito de xadrez do **Instituto Fliegen** (Cotia/SP) para o **nivelamento dos alunos novos**: quem entra no Instituto aprende o básico do xadrez no próprio ritmo e acompanha as aulas com mais facilidade.

Projeto de nivelamento · Instituto Fliegen + Pedro Marques Mesquita.

- **Atividade Extensionista II** — Análise e Desenvolvimento de Sistemas, UNINTER
- **ODS 4** (Educação de Qualidade) e **ODS 10** (Redução das Desigualdades)
- **Site no ar:** https://pedromesquita7.github.io/curso-xadrez-fliegen/
- **Site do Instituto:** https://pedromesquita7.github.io/instituto-fliegen/

## O problema e a solução

O Instituto Fliegen é um projeto educacional social, sem fins lucrativos, que prepara estudantes de escolas públicas de Cotia e região para as Olimpíadas do Conhecimento. Os alunos novos podem chegar com níveis diferentes de xadrez, de quem já joga a quem nunca tocou numa peça. Este site oferece um caminho único e gratuito, do movimento das peças até as primeiras táticas, que o aluno pode seguir em casa ou no Instituto, no celular ou no computador.

## Páginas

| Página | O que faz |
|---|---|
| `index.html` | Início: apresentação do curso, sobre o projeto, os 4 módulos, o Instituto, acessibilidade e contato |
| `aulas.html` | **Aulas práticas**: trilha com 4 módulos e 19 aulas (58 exercícios) no tabuleiro |
| `treinar.html` | 10 problemas de mate em 1, 6 de mate em 2, partidas contra o computador (Fácil e Médio) e jogo em dupla no mesmo aparelho |
| `regras.html` | Todas as regras num só lugar, com exemplos em que se toca na peça |
| `verificar-problemas.html` | Página de apoio (fora do menu): confere se cada problema e cada exercício das aulas tem solução |

Não tem cadastro, senha, banco de dados nem servidor. É só HTML, CSS e JavaScript.

## Aulas práticas

| Módulo | Aulas |
|---|---|
| 1. As peças do xadrez | A torre · O bispo · A dama · O rei · O cavalo · O peão (inclui promoção) |
| 2. Fundamentos | Capturar · Defender · Combate · Xeque em 1 · Salve o rei · Mate em 1 |
| 3. Intermediário | Posição inicial · Roque · En passant · Rei afogado |
| 4. Táticas | Valor das peças · Garfo · Cravada · Desafio: mate em 2 (leva à página Treinar) |

Todo exercício tem **Dica** (primeiro mostra a peça, depois a casa) e **Recomeçar**. Lance errado volta sozinho. O progresso fica salvo só no aparelho e pode ser apagado na própria página.

## Requisitos

**Funcionais**

1. Mostrar a trilha de aulas com o progresso geral e o de cada aula.
2. Validar cada lance do aluno e dizer se o objetivo do exercício foi cumprido.
3. Dar dica em duas etapas (peça, depois destino) e permitir recomeçar o exercício.
4. Desfazer sozinho o lance errado.
5. Oferecer problemas de mate em 1 e em 2, partida contra o computador e jogo em dupla.
6. Guardar o progresso no próprio aparelho e permitir apagá-lo.
7. Permitir aumentar o texto e ligar o alto contraste.

**Não funcionais**

1. Funcionar no celular, sem rolagem lateral, com botões de no mínimo 44 px.
2. Não coletar dados pessoais nem exigir cadastro (o público inclui menores de idade).
3. Rodar como site estático, sem servidor, publicado de graça no GitHub Pages.
4. Permitir uso por teclado e por leitor de tela (casas do tabuleiro são botões com nome).
5. Contraste de texto de no mínimo 4,5:1.

## Como o site aplica os 7 Princípios do Desenho Universal

| Princípio | No site |
|---|---|
| Igualitário | Gratuito, sem cadastro e sem senha |
| Adaptável | Texto ampliável (A− / A+), alto contraste, uso por toque, mouse ou teclado (setas e Enter) |
| Intuitivo | Aulas curtas em ordem, frases simples, mesmo menu em todas as páginas |
| Informação de fácil percepção | Destinos e capturas marcados por forma (ponto e anel), não só por cor; cada casa tem nome para leitores de tela |
| Tolerância ao erro | Lance errado volta sozinho; "Dica" e "Recomeçar" em todos os exercícios; "Desfazer lance" na partida |
| Baixo esforço físico | Mover = tocar a peça e a casa; botões grandes |
| Dimensão e espaço | Layout responsivo; no celular, o enunciado aparece acima do tabuleiro |

## Ver no computador

Dê dois cliques em `index.html`. Funciona sem internet (só a fonte Poppins precisa de internet; sem ela, o site usa a fonte do aparelho).

## Publicar (GitHub Pages)

1. Crie um repositório **público** chamado `curso-xadrez-fliegen`.
2. Em *Add file → Upload files*, arraste **o conteúdo** desta pasta. O `index.html` tem que ficar na raiz.
3. Em *Settings → Pages*, escolha *Deploy from a branch*, branch `main` e pasta `/ (root)`. Salve.
4. Espere 1 a 2 minutos e abra https://pedromesquita7.github.io/curso-xadrez-fliegen/

## Mudar ou acrescentar exercícios

Edite `js/dados-aulas.js` (o começo do arquivo explica cada campo). Depois, abra `verificar-problemas.html`: ela confere se cada exercício é possível e se a posição é legal.

## Limitações

- O computador do Treinar é simples (Fácil: quase ao acaso; Médio: pensa 2 lances à frente).
- O jogo em dupla é só no mesmo aparelho.
- Não é possível arrastar peças; o movimento é por toque ou clique em duas etapas.
- As peças usam símbolos de xadrez das fontes do aparelho, então o aspecto varia um pouco entre Android, iPhone e computadores.
- O site não envia nem coleta dados e não registra acessos.
- Não troque o `vendor/chess.min.js` (versão 1.4.0) sem testar tudo de novo.

## Estrutura de arquivos

```
index.html  aulas.html  treinar.html  regras.html
verificar-problemas.html      (apoio para quem administra; fora do menu)
css/estilo.css
js/dados-aulas.js             (conteúdo das aulas práticas)
js/aulas-motor.js  js/aulas.js
js/dados-problemas.js         (problemas do Treinar)
js/logica.js  js/tabuleiro.js  js/comum.js  js/regras.js  js/treinar.js
vendor/chess.min.js           (biblioteca chess.js + licença)
assets/                       (logos, libélula e ícones do Instituto)
```

## Créditos e licenças

- Validação dos lances: [chess.js](https://github.com/jhlywa/chess.js) 1.4.0, licença BSD-2 (`vendor/chess.js-LICENSE.txt`).
- A trilha segue a sequência clássica de ensino do xadrez (peças → fundamentos → lances especiais → táticas). Textos, posições e código foram escritos para este projeto.
- Logo, nome e identidade visual: Instituto Fliegen.
