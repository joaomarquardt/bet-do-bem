import { Bet, Transaction, User, Wallet } from '@/lib/types';

const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

export const MOCK_USERS: User[] = [
  { id: '1', username: 'lucasfit', displayName: 'Lucas Silva', avatarColor: '#4ECDC4', wins: 12, losses: 5, draws: 2 },
  { id: '2', username: 'mariabeast', displayName: 'Maria Santos', avatarColor: '#FF6B6B', wins: 8, losses: 3, draws: 1 },
  { id: '3', username: 'pedrorun', displayName: 'Pedro Costa', avatarColor: '#45B7D1', wins: 15, losses: 7, draws: 3 },
  { id: '4', username: 'anachall', displayName: 'Ana Oliveira', avatarColor: '#FFEAA7', wins: 6, losses: 2, draws: 0 },
  { id: '5', username: 'rafastrong', displayName: 'Rafael Lima', avatarColor: '#DDA0DD', wins: 10, losses: 8, draws: 4 },
  { id: '6', username: 'juliagym', displayName: 'Julia Martins', avatarColor: '#96CEB4', wins: 9, losses: 4, draws: 1 },
];

export const MOCK_CURRENT_USER: User = {
  id: 'me',
  username: 'betplayer',
  displayName: 'Jogador',
  avatarColor: '#00E676',
  wins: 7,
  losses: 3,
  draws: 1,
};

export const MOCK_FEED_BETS: Bet[] = [
  {
    id: 'bet-1',
    title: '100 flexoes em 2 minutos',
    description: 'Aposto que consigo fazer 100 flexoes em menos de 2 minutos sem parar!',
    buyIn: 50,
    status: 'IN_JUDGMENT',
    creatorId: '1',
    creator: MOCK_USERS[0],
    opponentId: '2',
    opponent: MOCK_USERS[1],
    creatorProof: {
      id: 'p1', userId: '1', description: 'Feito! 100 flexoes em 1:48. Confere o video!',
      mediaType: 'photo', mediaUri: '', createdAt: '2026-02-22T10:30:00Z',
    },
    opponentProof: {
      id: 'p2', userId: '2', description: 'Completei em 1:55! Foi apertado mas consegui!',
      mediaType: 'photo', mediaUri: '', createdAt: '2026-02-22T11:00:00Z',
    },
    comments: [
      { id: 'c1', userId: '3', username: 'pedrorun', text: 'Lucas tava mais rapido, voto nele!', createdAt: '2026-02-22T12:00:00Z' },
      { id: 'c2', userId: '4', username: 'anachall', text: 'Maria fez com boa forma, merece!', createdAt: '2026-02-22T12:15:00Z' },
      { id: 'c3', userId: '5', username: 'rafastrong', text: 'Esse ta apertado demais', createdAt: '2026-02-22T12:30:00Z' },
    ],
    votes: { creatorVotes: 14, opponentVotes: 11 },
    deadline: '2026-02-23T23:59:00Z',
    createdAt: '2026-02-20T09:00:00Z',
  },
  {
    id: 'bet-2',
    title: 'Corrida de 5km abaixo de 25min',
    description: 'Quem faz 5km mais rapido? Menos de 25 minutos ou nao vale!',
    buyIn: 100,
    status: 'IN_JUDGMENT',
    creatorId: '3',
    creator: MOCK_USERS[2],
    opponentId: '5',
    opponent: MOCK_USERS[4],
    creatorProof: {
      id: 'p3', userId: '3', description: 'Terminei em 22:30! Tava inspirado hoje!',
      mediaType: 'photo', mediaUri: '', createdAt: '2026-02-21T08:00:00Z',
    },
    opponentProof: {
      id: 'p4', userId: '5', description: '23:15 aqui. Bem perto mas Pedro voou!',
      mediaType: 'photo', mediaUri: '', createdAt: '2026-02-21T09:00:00Z',
    },
    comments: [
      { id: 'c4', userId: '6', username: 'juliagym', text: 'Pedro monstro! 22:30 e insano', createdAt: '2026-02-21T10:00:00Z' },
      { id: 'c5', userId: '4', username: 'anachall', text: 'Rafa chegou perto, respeito!', createdAt: '2026-02-21T10:30:00Z' },
    ],
    votes: { creatorVotes: 22, opponentVotes: 8 },
    deadline: '2026-02-24T23:59:00Z',
    createdAt: '2026-02-19T15:00:00Z',
  },
  {
    id: 'bet-3',
    title: 'Plancha por 5 minutos',
    description: 'Desafio: quem aguenta mais tempo na plancha! Minimo 5 minutos.',
    buyIn: 30,
    status: 'IN_JUDGMENT',
    creatorId: '4',
    creator: MOCK_USERS[3],
    opponentId: '6',
    opponent: MOCK_USERS[5],
    creatorProof: {
      id: 'p5', userId: '4', description: 'Aguentei 6:20! Quase morri mas valeu!',
      mediaType: 'photo', mediaUri: '', createdAt: '2026-02-22T16:00:00Z',
    },
    opponentProof: {
      id: 'p6', userId: '6', description: '5:45 de plancha. Foco total!',
      mediaType: 'photo', mediaUri: '', createdAt: '2026-02-22T17:00:00Z',
    },
    comments: [
      { id: 'c6', userId: '1', username: 'lucasfit', text: 'Ana destruiu! 6:20 nao e brincadeira', createdAt: '2026-02-22T18:00:00Z' },
    ],
    votes: { creatorVotes: 18, opponentVotes: 12 },
    deadline: '2026-02-25T23:59:00Z',
    createdAt: '2026-02-20T14:00:00Z',
  },
];

export const MOCK_MY_BETS: Bet[] = [
  {
    id: 'mybet-1',
    title: '50 abdominais em 1 minuto',
    description: 'Pedro me desafiou! Vamos ver quem faz mais rapido.',
    buyIn: 40, status: 'INVITED', creatorId: '3', creator: MOCK_USERS[2],
    opponentId: 'me', opponent: MOCK_CURRENT_USER,
    comments: [], votes: { creatorVotes: 0, opponentVotes: 0 },
    deadline: '2026-02-26T23:59:00Z', createdAt: '2026-02-23T08:00:00Z',
  },
  {
    id: 'mybet-2',
    title: 'Quem nada 400m mais rapido',
    description: 'Ana quer provar que nada melhor que eu. Veremos!',
    buyIn: 75, status: 'INVITED', creatorId: '4', creator: MOCK_USERS[3],
    opponentId: 'me', opponent: MOCK_CURRENT_USER,
    comments: [], votes: { creatorVotes: 0, opponentVotes: 0 },
    deadline: '2026-02-27T23:59:00Z', createdAt: '2026-02-23T09:00:00Z',
  },
  {
    id: 'mybet-3',
    title: 'Desafio de barra fixa',
    description: 'Quem faz mais barras em uma serie? Eu aposto em mim!',
    buyIn: 60, status: 'IN_PROGRESS', creatorId: 'me', creator: MOCK_CURRENT_USER,
    opponentId: '1', opponent: MOCK_USERS[0],
    comments: [], votes: { creatorVotes: 0, opponentVotes: 0 },
    deadline: '2026-02-25T23:59:00Z', createdAt: '2026-02-21T12:00:00Z',
  },
  {
    id: 'mybet-4',
    title: 'Corrida de escada - 20 andares',
    description: 'Subir 20 andares o mais rapido possivel!',
    buyIn: 80, status: 'IN_PROGRESS', creatorId: '5', creator: MOCK_USERS[4],
    opponentId: 'me', opponent: MOCK_CURRENT_USER,
    opponentProof: {
      id: 'p-my', userId: 'me', description: 'Subi em 4:30! Pernas tremendo!',
      mediaType: 'photo', mediaUri: '', createdAt: '2026-02-22T15:00:00Z',
    },
    comments: [], votes: { creatorVotes: 0, opponentVotes: 0 },
    deadline: '2026-02-24T23:59:00Z', createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'mybet-5',
    title: 'Desafio de burpees - 50 reps',
    description: 'Aposto que faco 50 burpees mais rapido que voce!',
    buyIn: 45, status: 'FINISHED_WIN_CREATOR', creatorId: 'me', creator: MOCK_CURRENT_USER,
    opponentId: '2', opponent: MOCK_USERS[1],
    creatorProof: { id: 'p-old1', userId: 'me', description: 'Feito em 3:20!', mediaType: 'photo', mediaUri: '', createdAt: '2026-02-18T10:00:00Z' },
    opponentProof: { id: 'p-old2', userId: '2', description: 'Demorei 4:10...', mediaType: 'photo', mediaUri: '', createdAt: '2026-02-18T11:00:00Z' },
    comments: [], votes: { creatorVotes: 25, opponentVotes: 10 },
    deadline: '2026-02-19T23:59:00Z', createdAt: '2026-02-16T09:00:00Z',
  },
  {
    id: 'mybet-6',
    title: 'Agachamento com 100kg',
    description: 'Quem faz mais reps com 100kg no agachamento?',
    buyIn: 120, status: 'FINISHED_WIN_OPPONENT', creatorId: 'me', creator: MOCK_CURRENT_USER,
    opponentId: '3', opponent: MOCK_USERS[2],
    creatorProof: { id: 'p-old3', userId: 'me', description: '8 reps. Dei meu maximo!', mediaType: 'photo', mediaUri: '', createdAt: '2026-02-15T10:00:00Z' },
    opponentProof: { id: 'p-old4', userId: '3', description: '12 reps! Pedro e forte demais.', mediaType: 'photo', mediaUri: '', createdAt: '2026-02-15T11:00:00Z' },
    comments: [], votes: { creatorVotes: 5, opponentVotes: 30 },
    deadline: '2026-02-17T23:59:00Z', createdAt: '2026-02-13T09:00:00Z',
  },
];

export const MOCK_WALLET: Wallet = {
  balance: 850,
  transactions: [
    { id: 't1', type: 'PRIZE_WON', amount: 90, description: 'Premio - Desafio de burpees', betId: 'mybet-5', createdAt: '2026-02-19T12:00:00Z' },
    { id: 't2', type: 'BET_ENTRY', amount: -80, description: 'Entrada - Corrida de escada', betId: 'mybet-4', createdAt: '2026-02-20T10:00:00Z' },
    { id: 't3', type: 'BET_ENTRY', amount: -60, description: 'Entrada - Desafio de barra fixa', betId: 'mybet-3', createdAt: '2026-02-21T12:00:00Z' },
    { id: 't4', type: 'BET_ENTRY', amount: -120, description: 'Entrada - Agachamento com 100kg', betId: 'mybet-6', createdAt: '2026-02-13T09:00:00Z' },
    { id: 't5', type: 'REFUND_DRAW', amount: 50, description: 'Reembolso - Desafio empatado', createdAt: '2026-02-12T10:00:00Z' },
    { id: 't6', type: 'PRIZE_WON', amount: 150, description: 'Premio - Sprint de 100m', createdAt: '2026-02-10T14:00:00Z' },
    { id: 't7', type: 'BET_ENTRY', amount: -75, description: 'Entrada - Sprint de 100m', createdAt: '2026-02-09T08:00:00Z' },
    { id: 't8', type: 'BET_ENTRY', amount: -45, description: 'Entrada - Desafio de burpees', betId: 'mybet-5', createdAt: '2026-02-16T09:00:00Z' },
  ],
};
