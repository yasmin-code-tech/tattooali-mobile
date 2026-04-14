import { api } from '../lib/api';

/** Lista nomes de estilos cadastrados no backend (para chips de filtro). */
export async function buscarCatalogoEstilos() {
  return api.get('/api/style');
}

/**
 * @param {string} [q] - texto livre (nome, bio, endereço)
 * @param {string} [estilo] - chip da UI ou "Todos"
 */
export async function buscarTatuadores(q = '', estilo = 'Todos') {
  const qs = new URLSearchParams();
  if (q && String(q).trim()) qs.set('q', String(q).trim());
  qs.set('estilo', estilo || 'Todos');
  return api.get(`/api/tatuador/search?${qs.toString()}`);
}

export function mapBuscaToArtist(t) {
  const uid = Number(t.user_id);
  const styles =
    Array.isArray(t.styles) && t.styles.length > 0
      ? t.styles
      : ['Estilos não informados'];
  const name = `${t.nome || ''} ${t.sobrenome || ''}`.trim() || 'Tatuador';
  const foto = t.foto && String(t.foto).trim() ? String(t.foto).trim() : null;
  const bairroRaw = t.bairro_nome ?? t.Bairro?.nome;
  const bairro =
    bairroRaw != null && String(bairroRaw).trim()
      ? String(bairroRaw).trim()
      : null;
  return {
    id: String(Number.isFinite(uid) ? uid : ''),
    user_id: Number.isFinite(uid) ? uid : null,
    name,
    styles,
    bairro,
    address: t.endereco || 'Endereço não informado',
    avg_rating:
      t.avg_rating != null && !Number.isNaN(Number(t.avg_rating))
        ? Math.min(5, Math.max(0, Number(t.avg_rating)))
        : 0,
    avatar: foto,
    bio: t.bio || '',
    gallery: [],
    comments: [],
  };
}

export async function fetchTatuadorDetalhes(userId) {
  const id = Number.parseInt(String(userId), 10);
  if (!Number.isFinite(id) || id < 1) {
    throw new Error('ID do tatuador inválido.');
  }
  const [perfil, styles, photos, reviews] = await Promise.all([
    api.get(`/api/tatuador/${id}`),
    api.get(`/api/tatuador/${id}/styles`),
    api.get(`/api/tatuador/${id}/photos`),
    api.get(`/api/tatuador/${id}/reviews`),
  ]);

  const name =
    `${perfil?.nome || ''} ${perfil?.sobrenome || ''}`.trim() || 'Tatuador';
  const bairroNome = perfil?.Bairro?.nome ?? perfil?.bairro_nome;
  const bairro =
    bairroNome != null && String(bairroNome).trim()
      ? String(bairroNome).trim()
      : null;
  const styleNames = (styles || []).map((s) => s.nome).filter(Boolean);
  const revs = Array.isArray(reviews) ? reviews : [];
  const avg =
    revs.length > 0
      ? Math.round(
          (revs.reduce((a, r) => a + (Number(r.nota) || 0), 0) / revs.length) *
            10,
        ) / 10
      : 0;

  return {
    name,
    bairro,
    styles:
      styleNames.length > 0 ? styleNames : ['Estilos não informados'],
    address: perfil?.endereco || 'Endereço não informado',
    avg_rating: avg,
    avatar: perfil?.foto && String(perfil.foto).trim() ? perfil.foto : null,
    bio: perfil?.bio || 'Sem descrição no perfil.',
    gallery: (photos || [])
      .map((p) => p.url)
      .filter((u) => u && String(u).trim()),
    comments: revs.map((r, i) => {
      const raw =
        r.cliente?.nome != null
          ? String(r.cliente.nome).trim()
          : r.cliente_nome != null
            ? String(r.cliente_nome).trim()
            : '';
      const author = raw || 'Cliente';
      return {
        id: String(r.review_id ?? i),
        author,
        text: r.comentario || '',
        rating: Number(r.nota) || 0,
      };
    }),
  };
}
