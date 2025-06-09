# 🤖 Local-GPT - Lokalny Asystent AI

Klon ChatGPT działający w 100% lokalnie w przeglądarce z WebLLM i IndexedDB.

## 🔐 Zabezpieczenia API Keys

Aplikacja automatycznie szyfruje klucze API przed zapisaniem do bazy danych:

```bash
# Opcjonalnie: ustaw własny klucz szyfrowania w .env
VITE_ENCRYPTION_KEY=twoj-super-tajny-klucz-min-32-znaki

# Przykład:
VITE_ENCRYPTION_KEY=d8f4a6b2c9e1f7a3b5d8e2f6c1a4b7e9f2d5c8a1b4e7f9a2c5d8e1b4f7a9c2d5
```

Jeśli nie ustawisz klucza, aplikacja wygeneruje i zapisze go lokalnie w przeglądarce.

## ⌨️ Skróty klawiszowe

- `Alt + N` - Nowy chat
- `Alt + B` - Pokaż/ukryj sidebar
- `Alt + J` - Szukaj w chatach
- `Alt + P` - Przypnij aktualny chat
- `Alt + R` - Zmień nazwę chatu
- `Alt + Delete` - Usuń chat
- `?` - Pokaż wszystkie skróty

## 🛠️ Technologie

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
