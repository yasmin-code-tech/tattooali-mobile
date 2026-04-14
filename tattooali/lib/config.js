import Constants from 'expo-constants';

/**
 * Host onde o Metro está acessível (mesma rede do celular no `expo start`).
 * Assim o app não usa `localhost` no aparelho — lá localhost é o próprio celular.
 */
function inferDevMachineHost() {
  try {
    const candidates = [
      Constants.expoConfig?.hostUri,
      Constants.expoGoConfig?.debuggerHost,
      Constants.manifest2?.extra?.expoGo?.debuggerHost,
      Constants.manifest?.debuggerHost,
    ];
    for (const hostUri of candidates) {
      if (!hostUri || typeof hostUri !== 'string') continue;
      const host = hostUri.split(':')[0]?.trim();
      if (!host || host === 'localhost' || host === '127.0.0.1') continue;
      return host;
    }
  } catch {
    /* noop */
  }
  return null;
}

const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
const devHost = typeof __DEV__ !== 'undefined' && __DEV__ ? inferDevMachineHost() : null;

/**
 * Ordem: .env → IP do Metro na dev → localhost (só faz sentido em emulador/simulador).
 * Produção: defina sempre EXPO_PUBLIC_API_URL (https).
 */
const raw =
  fromEnv ||
  (devHost ? `http://${devHost}:3000` : '') ||
  'http://localhost:3000';

export const API_ORIGIN = String(raw).replace(/\/$/, '');

export const API_BASE = `${API_ORIGIN}/api`;

/** Útil para logs / tela de debug no app (só use em __DEV__). */
export function getApiConfigDebug() {
  const source = fromEnv
    ? 'EXPO_PUBLIC_API_URL (.env)'
    : devHost
      ? 'IP do Metro (dev automático)'
      : 'padrão localhost';

  const hints = [];
  if (fromEnv) {
    if (/:8081(\/|$)/.test(fromEnv)) {
      hints.push(
        'A porta 8081 é o Metro (bundler). O backend costuma ser :3000 — ex.: http://192.168.100.21:3000',
      );
    }
    if (/localhost|127\.0\.0\.1/i.test(fromEnv)) {
      hints.push(
        'No celular físico, localhost é o aparelho — use o IP do PC na mesma rede Wi‑Fi.',
      );
    }
  }
  const hint = hints.length ? hints.join('\n\n') : undefined;

  return { API_ORIGIN, source, hint };
}
