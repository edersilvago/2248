# 2248

Clone do puzzle **2248 – Number Puzzle Game** feito em **Electron**: arraste e conecte números no tabuleiro para somá-los.

## Como jogar

- Tabuleiro 7×7 sempre cheio de números.
- Arraste conectando blocos adjacentes em 8 direções (horizontais, verticais e diagonais).
- A próxima célula precisa ter o **mesmo valor da anterior** ou **exatamente o total acumulado da corrente** (`2` + `2` = `4`, então pode pegar um `4`; depois `8`, `16`... sem pular etapas).
- Ao soltar, todos os blocos da corrente somem e o último recebe a soma total, ocupando a posição onde a corrente terminou.
- Os blocos restantes caem para o fundo (gravidade) e os espaços no topo recebem números novos.
- Voltar o cursor sobre a célula anterior desfaz o último passo do arraste.
- Fim de jogo quando **não existir** nenhum par igual adjacente, pois toda corrente válida começa com um par igual.

## Como rodar

```bash
npm install
npm start
```

Requer Node.js 18+.

## Tecnologias

- Electron
- HTML + CSS + JavaScript puro (sem frameworks)

## Estrutura

```
main.js      # processo principal do Electron (janela)
index.html   # estrutura da página
style.css    # estilos e responsividade
game.js      # lógica do jogo
```

## Como gerar builds

### Windows (exe portátil)

```bash
npm install
npm run dist
```

Saída: `release\2248-Portable.exe`

### Android (APK)

Requer JDK 21 e Android SDK (platforms;android-35, build-tools;35.0.0).

```bash
npm install
npx cap sync android
cd android && gradlew.bat assembleDebug
```

Saída: `android\app\build\outputs\apk\debug\app-debug.apk`
