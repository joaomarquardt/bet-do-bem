export type BetStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'IN_JUDGMENT'
  | 'FINISHED_WIN_CREATOR'
  | 'FINISHED_WIN_OPPONENT'
  | 'FINISHED_DRAW';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  wins: number;
  losses: number;
  draws: number;
}

export interface Proof {
  id: string;
  userId: string;
  description: string;
  mediaType: 'photo' | 'video';
  mediaUri: string;
  createdAt: string;
}

export interface ProofComment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  judgeId: string;
  betId: string;
  votedForUserId: string;
  createdAt: string;
}

export interface Bet {
  id: string;
  title: string;
  description: string;
  buyIn: number;
  status: BetStatus;
  creatorId: string;
  creator: User;
  opponentId: string;
  opponent: User;
  creatorProof?: Proof;
  opponentProof?: Proof;
  comments: ProofComment[];
  votes: { creatorVotes: number; opponentVotes: number };
  deadline: string;
  createdAt: string;
  myVote?: string;
}

export interface Transaction {
  id: string;
  type: 'BET_ENTRY' | 'PRIZE_WON' | 'REFUND_DRAW';
  amount: number;
  description: string;
  betId?: string;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  transactions: Transaction[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  displayName: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface CreateBetRequest {
  title: string;
  description: string;
  buyIn: number;
  opponentUsername: string;
}

export interface VoteRequest {
  betId: string;
  votedForUserId: string;
}

export interface UploadProofRequest {
  betId: string;
  description: string;
  mediaUri: string;
  mediaType: 'photo' | 'video';
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface CreateActivityRequest {
  title: string;
  description: string;
}

export interface UpdateActivityRequest {
  title: string;
  description: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface CreateChallengeRequest {
  title: string;
  description: string;
}

export interface UpdateChallengeRequest {
  title: string;
  description: string;
}

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
}

export interface UpdateGroupRequest {
  name: string;
  description: string;
}

export interface CreateProofRequest {
  description: string;
  mediaUri: string;
  mediaType: 'photo' | 'video';
}

export interface UpdateProofRequest {
  description: string;
  mediaUri: string;
  mediaType: 'photo' | 'video';
}

export interface CreateVoteRequest {
  judgeId: string;
  votedForUserId: string;
}

export interface UpdateVoteRequest {
  judgeId: string;
  votedForUserId: string;
}

export interface CreateUserRequest {
  username: string;
  displayName: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  displayName: string;
  email: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface CreateCommentRequest {
    userId: string;
    text: string;
}
