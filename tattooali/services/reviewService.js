import { api } from '../lib/api';

/**
 * Lista avaliações do usuário logado (JWT no AsyncStorage).
 * Com `clienteId` (Clients.client_id): GET /api/reviews/cliente/:id.
 * Sem id: GET /api/reviews/all (todas as fichas com o mesmo CPF).
 */
export async function fetchMinhasAvaliacoes(clienteId) {
  const n = Number(clienteId);
  const path =
    clienteId != null &&
    String(clienteId).trim() !== '' &&
    Number.isFinite(n) &&
    n > 0
      ? `/api/reviews/cliente/${n}`
      : '/api/reviews/all';
  const rows = await api.get(path);
  if (!Array.isArray(rows)) return [];
  return rows.map(mapReviewToCard);
}

/** Converte payload do backend (Sequelize) para o shape do ReviewCard. */
export function mapReviewToCard(raw) {
  const t = raw.tatuador || {};
  const nome = [t.nome, t.sobrenome].filter(Boolean).join(' ').trim() || 'Tatuador';
  const when = raw.data_sessao ?? raw.createdAt ?? raw.updatedAt;
  const dataIso =
    when instanceof Date
      ? when.toISOString()
      : typeof when === 'string' && when.length
        ? when.includes('T')
          ? when
          : `${when.replace(' ', 'T')}`
        : new Date().toISOString();

  return {
    id: raw.review_id,
    nota: Number(raw.nota) || 0,
    comentario: String(raw.comentario ?? ''),
    data: dataIso,
    tatuador: {
      id: t.user_id ?? null,
      nome,
      avatar: t.foto ?? null,
      bairro: t.bairro_nome ?? t.bairro ?? null,
    },
  };
}