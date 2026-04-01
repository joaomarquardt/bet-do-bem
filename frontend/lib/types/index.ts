
export type ActivityStatus =
  | 'IN_JUDGMENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

export type BetStatus =
  | 'INVITED'
  | 'DECLINED'
  | 'IN_PROGRESS'
  | 'IN_JUDGMENT'
  | 'FINISHED_WIN_CREATOR'
  | 'FINISHED_WIN_OPPONENT'
  | 'FINISHED_DRAW';

export type ChallengeStatus =
  | 'INVITED'
  | 'DECLINED'
  | 'IN_PROGRESS'
  | 'IN_JUDGMENT'
  | 'SUCCESS'
  | 'FAILED'
  | 'EXPIRED';

export type TransactionType =
  | 'DEPOSIT'
  | 'CHALLENGE_ENTRY'
  | 'CHALLENGE_WIN'
  | 'CHALLENGE_REFUND'
  | 'BET_ENTRY'
  | 'BET_WIN'
  | 'BET_REFUND'
  | 'REWARD';

export type ContextType =
  | 'ACTIVITY'
  | 'BET'
  | 'CHALLENGE'
  | 'GROUP'
  | 'PROOF'
  | 'TRANSACTION'
  | 'USER'
  | 'VOTE';

export type UserRole =
  | 'USER'
  | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  coins: number;
}

export interface Proof {
  id: number;
  fileName: string;
  contentType: string;
  imageUrl: string;
  authorId?: number;
  author: User;
  comments: ProofComment[];
  postedAt: string;
}

export interface ProofComment {
  id: number;
  proof: Proof;
  author: User;
  content: string;
  postedAt: string;
}

export interface Vote {
  id: number;
  voter: User;
  proof: Proof;
  approved: boolean;
  votedAt: string;
}

export interface Bet {
  id: number;
  title: string;
  description: string;
  creator: User;
  opponent: User;
  proofs: Proof[];
  buyIn: number;
  createdAt: string;
  closedAt: string;
  expiresAt: string;
  status: BetStatus;
  group: Group;
}

export interface Transaction {
  id: number;
  user: User;
  amount: number;
  transactionType: TransactionType;
  contextType: ContextType;
  contextId: number;
  createdAt: string;
}

export interface Group {
    id: number;
    name: string;
    description: string;
    creator: User;
    createdAt: string;
    members: User[];
}

export interface Activity {
    id: number;
    author: User;
    proof: Proof;
    description: string;
    status: ActivityStatus;
    createdAt: string;
    closedAt: string;
    expiresAt: string;
    group: Group;
}

export interface Challenge {
    id: number;
    challenger: User;
    challenged: User;
    title: string;
    description: string;
    amount: number;
    proof: Proof;
    createdAt: string;
    closedAt: string;
    deadline: string;
    status: ChallengeStatus;
    group: Group;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface CreateBetRequest {
  title: string;
  description: string;
  buyIn: number;
  creatorId: number;
  opponentId: number;
  groupId: number;
}

export interface CreateVoteRequest {
    approved: boolean;
}

export interface CreateProofRequest {
    fileName: string;
    contentType: string;
    imageUrl?: string;
}

export interface CreateCommentRequest {
    content: string;
    authorId: number;
}

export interface CreateActivityRequest {
    proof: CreateProofRequest;
    description: string;
    groupId: number;
}

export interface CreateChallengeRequest {
    challengerId: number;
    challengedId: number;
    title: string;
    description: string;
    amount: number;
    deadline: string;
    groupId: number;
}

export interface CreateGroupRequest {
    name: string;
    description: string;
    creatorId: number;
    memberIds: number[];
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
}

export interface UpdateActivityRequest {
    description: string;
}

export interface UpdateBetRequest {
    title: string;
    description: string;
    creatorId: number;
    opponentId: number;
}

export interface UpdateChallengeRequest {
    title: string;
    description: string;
    penaltyValue: number;
    proofId: number;
    deadline: string;
    status: ChallengeStatus;
}

export interface UpdateProofRequest {
    imageUrl: string;
    description: string;
    authorId: number;
}

export interface UpdateUserRequest {
    name: string;
    email: string;
    coins: number;
}

export interface UpdateVoteRequest {
    voterId: number;
    proofId: number;
    approved: boolean;
}

export interface ActivityResponse {
    id: number;
    author: UserResponse;
    proof: Proof;
    description: string;
    status: ActivityStatus;
    groupId: number;
    createdAt: string;
    closedAt: string;
    expiresAt: string;
}

export interface BetResponse {
    id: number;
    title: string;
    description: string;
    creator: UserResponse;
    opponent: UserResponse;
    proofs: ProofResponse[];
    buyIn: number;
    status: BetStatus;
    groupId: number;
    createdAt: string;
    closedAt: string;
    expiresAt: string;
}

export interface ChallengeResponse {
    id: number;
    challenger: UserResponse;
    challenged: UserResponse;
    title: string;
    description: string;
    amount: number;
    status: ChallengeStatus;
    groupId: number;
    proof: ProofResponse;
    createdAt: string;
    deadline: string;
}

export interface CommentResponse {
    id: number;
    content: string;
    authorId: number;
    authorName: string;
    postedAt: string;
}

export interface CreatedActivityResponse {
    activity: ActivityResponse;
    uploadUrl: string;
}

export interface FeedItemResponse {
    id: number;
    feedItemType: ContextType;
    createdAt: string;
    content: any;
}

export interface GroupResponse {
    id: number;
    name: string;
    description: string;
    creator: UserResponse;
    members: UserResponse[];
    createdAt: string;
}

export interface ProofResponse {
    id: number;
    imageUrl: string;
    contentType: string;
    authorId: number;
    postedAt: string;
}

export interface ProofUploadResponse {
    proofResponse: ProofResponse;
    uploadUrl: string;
}

export interface TokenResponse {
    token: string;
}

export interface TransactionResponse {
    id: number;
    amount: number;
    contextId: number;
    contextType: ContextType;
    transactionType: TransactionType;
    createdAt: string;
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    coins: number;
}

export interface VoteResponse {
    id: number;
    voterId: number;
    proofId: number;
    approved: boolean;
    votedAt: string;
}

export interface VotesByProof {
    approvedVotes: number;
    rejectedVotes: number;
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

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
