# tattooali-mobile

Repositório da versão **mobile** do Tattooali (app cliente, Expo / React Native).

## Onde está o código?

| Pasta | O que é |
|--------|---------|
| **`tattooali/`** | **App Expo de verdade**: `package.json`, `node_modules`, telas, `App.js`, `app.json`. **É aqui que você instala dependências e roda o Metro.** |
| Raiz (`tattooali-mobile/`) | Só metadados do repo: `README`, `LICENSE`, `.gitignore`, e um `package.json` **mínimo** que só repassa comandos para `tattooali/`. |

Se aparecer `package-lock.json` **só na raiz** (sem ter mexido em `tattooali/`), costuma ser porque rodou `npm install` no lugar errado — pode apagar esse lock da raiz; o lock **oficial** é `tattooali/package-lock.json`.

## Estrutura (resumida)

```
tattooali-mobile/
├── package.json          # Atalhos: npm start → roda Expo em tattooali/
├── README.md
├── LICENSE
├── .env                  # (opcional) cópia na raiz; o Expo lê o .env em tattooali/
└── tattooali/            # ← projeto Expo
    ├── App.js
    ├── app.json
    ├── package.json
    ├── package-lock.json
    ├── screens/          # Telas (auth/, Agenda, Busca, Chat, Perfil…)
    ├── navigation/
    ├── components/
    ├── context/          # AuthContext, ConversationsContext…
    ├── lib/              # api.js, config.js, supabase…
    ├── services/
    ├── assets/
    └── theme.js
```

## Requisitos

- **Node.js** ≥ **18** (recomendado **20 LTS**). Expo 54 e o `@expo/cli` usam sintaxe moderna (`??` etc.); com Node 12 ou 10 aparece `SyntaxError: Unexpected token '?'`.
- **npm** ≥ 9 (vem com Node 20; se o seu `npm -v` for **6.x**, o Node está desatualizado).
- **Expo Go** no celular para testar em dispositivo físico

### “Unexpected token ?” ao dar `npm start`

O terminal está usando um **Node antigo**. Confira:

```bash
node -v
npm -v
```

Com **nvm**:

```bash
cd tattooali
nvm install   # lê .nvmrc (20)
nvm use
npm start
```

Sem nvm: instale Node 20 em [https://nodejs.org](https://nodejs.org) e abra um **novo** terminal.

## Instalação

**Opção A (recomendada):** entrar na pasta do app:

```bash
cd tattooali
npm install
```

**Opção B:** na raiz do repositório:

```bash
npm run setup
```

## Rodar o projeto

Na raiz:

```bash
npm start
```

Ou:

```bash
cd tattooali
npm start
```

### Rede local (mesmo Wi‑Fi)

Coloque o **`.env` dentro de `tattooali/`** (mesma pasta do `app.json` e `package.json`). O Expo **não** carrega automaticamente um `.env` só na raiz `tattooali-mobile/`.

Use `EXPO_PUBLIC_API_URL=http://SEU_IP:3000` (no celular físico **não** use `localhost`) e, para chat, `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` (chave **anon** inteira, sem texto extra no fim da linha).

Depois de mudar o `.env`, reinicie o Metro com cache limpo: `npx expo start -c`.

Escaneie o QR code pelo **Expo Go**.

### Tunnel (outras redes)

```bash
cd tattooali
npx expo start --tunnel
```

### Emuladores

```bash
cd tattooali
npm run android   # Android
npm run ios       # iOS (macOS)
npm run web
```

Ou, da raiz: `npm run android` / `npm run ios` / `npm run web`.

## Tecnologias (principais)

| Biblioteca | Uso |
|------------|-----|
| Expo ~54 | Toolchain |
| React 19 / RN 0.81 | UI |
| React Navigation 7 | Rotas |
| Supabase JS | Auth/chat (quando configurado) |

Versões exatas: ver `tattooali/package.json`.
