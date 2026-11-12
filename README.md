# 2248

Clone do puzzle **2248 – Number Puzzle Game** feito em **Electron**: arraste e conecte números no tabuleiro para somá-los.

## Como jogar

- Tabuleiro 7×7 sempre cheio de números.
- Arraste com o mouse (ou toque) conectando números **iguais** ou o **dobro do anterior**, em 8 direções (incluindo diagonais).
- Ao soltar, toda a cadeia some e vira um único número (a soma) na última célula.
- Voltar o cursor sobre a célula anterior desfaz o último passo do arraste.
- Novos números preenchem as células liberadas a cada jogada.
- O jogo acaba quando não existir mais nenhum movimento válido.

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
