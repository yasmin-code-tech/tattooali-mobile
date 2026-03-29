// ─── UTILS ────────────────────────────────────────────────────

/**
 * Format a timestamp into a human-readable label for the contact list.
 * - Same day  → "14:42"
 * - Yesterday → "Ontem"
 * - ≤ 7 days  → "Seg", "Ter", …
 * - Older     → "5 Mar"
 */
export function formatListTime(date) {
  const now   = new Date();
  const d     = new Date(date);

  const sameDay =
    d.getDate()     === now.getDate()     &&
    d.getMonth()    === now.getMonth()    &&
    d.getFullYear() === now.getFullYear();

  if (sameDay) {
    // CORREÇÃO: Adicionadas as crases
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate()     === yesterday.getDate()     &&
    d.getMonth()    === yesterday.getMonth()    &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Ontem';

  // Nota: Isso calcula a diferença em períodos de 24 horas, não necessariamente dias de calendário.
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) {
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return weekdays[d.getDay()];
  }

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  // CORREÇÃO: Adicionadas as crases
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/**
 * Format a timestamp into HH:MM for message bubbles.
 */
export function formatBubbleTime(date) {
  const d = new Date(date);
  // CORREÇÃO: Adicionadas as crases
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Current time as HH:MM string.
 */
export function nowTime() {
  return formatBubbleTime(new Date());
}

function pad(n) {
  return String(n).padStart(2, '0');
}