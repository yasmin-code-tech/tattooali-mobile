// ─── MOCK DATA ────────────────────────────────────────────────
// Simulated conversations for the Tattoali chat app

export const CONVERSATIONS = [
  {
    id: '1',
    name: 'Rafael Ink',
    avatar: '🎨',
    isOnline: true,
    unreadCount: 2,
    lastMessage: 'Traz as referências amanhã 👊',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 18), // 18 min ago
    messages: [
      { id: 'm1',  role: 'contact', text: 'Oi João! Confirmando sua sessão pra amanhã às 14h 🎨', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) },
      { id: 'm2',  role: 'user',    text: 'Oi Rafael! Confirmado sim! Já tô animado demais 🔥',   timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.9) },
      { id: 'm3',  role: 'user',    text: 'Perfeito! Vou levar as referências que separei',        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.6) },
      { id: 'm4',  role: 'contact', text: 'Ótimo! E lembra de fazer uma refeição antes, sessão vai durar umas 3h', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5) },
      { id: 'm5',  role: 'user',    text: 'Entendido 👍 Tenho que ir de metrô, tem estacionamento no estúdio?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5) },
      { id: 'm6',  role: 'contact', text: 'Tem sim! Mas o metrô Vila Lobos fica a 3 min a pé, muito fácil de achar', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.3) },
      { id: 'm7',  role: 'user',    text: 'Melhor ainda! Até amanhã 🤙',                          timestamp: new Date(Date.now() - 1000 * 60 * 25) },
      { id: 'm8',  role: 'contact', text: 'Traz as referências amanhã 👊',                        timestamp: new Date(Date.now() - 1000 * 60 * 18) },
    ],
  },
  {
    id: '2',
    name: 'Sil Watercolor',
    avatar: '🌊',
    isOnline: false,
    unreadCount: 0,
    lastMessage: 'Oi! Confirmado para o dia 28 ✅',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 26), // yesterday
    messages: [
      { id: 'm1', role: 'user',    text: 'Oi Sil! Queria confirmar o agendamento do dia 28.',   timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28) },
      { id: 'm2', role: 'contact', text: 'Oi João! Tudo certo, pode vir às 13h 😊',             timestamp: new Date(Date.now() - 1000 * 60 * 60 * 27.5) },
      { id: 'm3', role: 'user',    text: 'Perfeito! Vou levar algumas referências de aquarela.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 27) },
      { id: 'm4', role: 'contact', text: 'Oi! Confirmado para o dia 28 ✅',                     timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26) },
    ],
  },
  {
    id: '3',
    name: 'Marina Bones',
    avatar: '🖋️',
    isOnline: false,
    unreadCount: 0,
    lastMessage: 'Ficou incrível! Obrigada 🙏',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22), // 22 days ago
    messages: [
      { id: 'm1', role: 'contact', text: 'João, a tattoo cicatrizou bem?',                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 23) },
      { id: 'm2', role: 'user',    text: 'Sim! Ficou perfeita, melhor do que eu esperava!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22.5) },
      { id: 'm3', role: 'contact', text: 'Que bom! Manda foto quando puder 📸',             timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22.2) },
      { id: 'm4', role: 'user',    text: 'Ficou incrível! Obrigada 🙏',                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22) },
    ],
  },
  {
    id: '4',
    name: 'Tiago Dark Art',
    avatar: '✏️',
    isOnline: true,
    unreadCount: 0,
    lastMessage: 'Posso te encaixar no dia 10 às 10h!',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    messages: [
      { id: 'm1', role: 'user',    text: 'Oi Tiago! Tem algum horário disponível na próxima semana?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3.2) },
      { id: 'm2', role: 'contact', text: 'Oi! Deixa eu verificar minha agenda...',                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3.1) },
      { id: 'm3', role: 'contact', text: 'Posso te encaixar no dia 10 às 10h!',                      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
    ],
  },
];

// ─── AUTO-REPLY POOL ──────────────────────────────────────────
export const AUTO_REPLIES = [
  'Entendido! 👊',
  'Boa, até lá então!',
  'Pode deixar, qualquer coisa me chama 🎨',
  'Combinado!',
  'Perfeito, te espero lá! 🖤',
  'Ok! Confirmo aqui depois 👍',
  'Claro, sem problema!',
  'Anotado 📝',
];