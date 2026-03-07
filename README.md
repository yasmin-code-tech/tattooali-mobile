# tattooali-mobile

Repositório para a versão mobile do Tattooali (app cliente).

## Estrutura do projeto

```
tattooali-mobile/
├── tattooali/           # App Expo / React Native
│   ├── screens/         # Telas do app
│   │   ├── AgendaScreen.jsx
│   │   ├── BuscaScreen.jsx
│   │   ├── ChatScreen.jsx
│   │   ├── PerfilClienteScreen.jsx
│   │   └── PerfilTatuadorScreen.jsx
│   ├── App.js
│   ├── app.json
│   ├── index.js
│   └── package.json
├── LICENSE
└── README.md
```

## Requisitos

- **Node.js** ≥ 20.19.4
- **npm** ou **yarn**
- **Expo Go** instalado no celular (Android e/ou iPhone) para testar em dispositivo físico

## Tecnologias e bibliotecas

| Biblioteca | Versão |
|------------|--------|
| Expo | ~54.0.33 |
| React | 19.1.0 |
| React Native | 0.81.5 |
| React Navigation (native) | ^7.1.33 |
| React Navigation (native-stack) | ^7.14.4 |
| react-native-screens | ~4.16.0 |
| react-native-safe-area-context | ~5.6.0 |

## Instalação

```bash
cd tattooali
npm install
```

## Rodar o projeto

### Rede local (mesmo Wi‑Fi)

```bash
cd tattooali
npm start
```

Escaneie o QR code pelo **Expo Go** (não pela câmera padrão). Celular e computador precisam estar na mesma rede.

### Compartilhar com outras pessoas (tunnel)

Para outras pessoas testarem em dispositivos em redes diferentes:

```bash
cd tattooali
npx expo start --tunnel
```

O tunnel gera um link público. Qualquer pessoa com o Expo Go pode escanear o QR code ou usar o link gerado.

### Emuladores

```bash
# Android
npm run android

# iOS (apenas macOS)
npm run ios

# Web
npm run web
```
