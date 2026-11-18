Segunda versão do jogo.

## Novidades

- **Regra de encadeamento corrigida**: a corrente começa com dois blocos iguais, depois aceita blocos iguais ao anterior ou o dobro dele, sem pular etapas
- O último bloco da corrente vira **2× o maior valor ligado** (ex.: `8,8,8` → `16`); pontos = soma dos blocos ligados
- **Gravidade**: blocos caem para o fundo e novos números entram pelo topo
- Badge mostrando o valor final da corrente durante o arraste
- Layout responsivo: tabuleiro ocupa o máximo da tela, escala em qualquer resolução
- Correção da piscada ao arrastar (render incremental, sem reconstruir o tabuleiro)

## Downloads

- `2248-Portable.exe` — Windows, portátil, sem instalação
- `2248.apk` — Android, instalar autorizando "fontes desconhecidas"

## Como jogar

- Arraste conectando blocos adjacentes em 8 direções
- Comece com um par igual; depois ligue iguais ou o dobro do anterior
- O jogo acaba quando não existir nenhum par igual adjacente
