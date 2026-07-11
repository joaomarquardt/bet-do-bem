import { Bet, Challenge, Activity, FeedItemResponse, PaginatedResponse, CommentResponse, VotePercentageResponse } from '@/lib/types';

export type BetsTabItem = (Bet | Challenge | Activity) & {
  feedItemType: 'BET' | 'CHALLENGE' | 'ACTIVITY';
  commentsData?: PaginatedResponse<CommentResponse> | null;
  votePercentage?: VotePercentageResponse | null;
};

function safeUser(u: Record<string, unknown> | undefined, fallbackId = '') {
  const idRaw = String(u?.id ?? fallbackId);
  return {
    id: Number(idRaw) || 0,
    fullName: (u?.fullName ?? u?.name ?? u?.displayName ?? u?.username ?? `User ${idRaw}`) as string,
    email: (u?.email ?? '') as string,
    username: (u?.username ?? u?.name ?? u?.displayName ?? `user${idRaw}`) as string,
    role: (u?.role ?? 'USER') as string,
    coins: Number(u?.coins ?? 0),
    avatarColor: (u?.avatarColor ?? '#CCCCCC') as string,
    profilePictureUrl: (u?.profilePictureUrl ?? null) as string | null,
    wins: Number(u?.wins ?? 0),
    losses: Number(u?.losses ?? 0),
    draws: Number(u?.draws ?? 0),
  };
}

function mapProof(p: Record<string, unknown> | undefined) {
  if (!p) return undefined;
  return {
    id: Number(p.id ?? 0),
    imageUrl: (p.imageUrl ?? p.mediaUri ?? '') as string,
    contentType: (p.contentType ?? '') as string,
    fileName: (p.fileName ?? '') as string,
    postedAt: (p.postedAt ?? p.createdAt ?? new Date().toISOString()) as string,
    author: safeUser(
      (p.author as Record<string, unknown> | undefined) ??
        undefined,
      String(p.authorId ?? p.userId ?? ''),
    ),
    comments: (p.comments ?? []) as unknown[],
  };
}

export function mapFeedItemToBet(item: FeedItemResponse): Bet {
  const content = (item.content ?? item) as Record<string, unknown>;
  const creator = (content.creator ??
    content.creatorResponse ??
    content.creatorUser ?? {
      id: String(content.creatorId ?? ''),
      username: content.creatorUsername ?? '',
      fullName: content.creatorFullName ?? content.creatorDisplayName ?? content.creatorName ?? '',
      avatarColor: '#CCCCCC',
      wins: 0,
      losses: 0,
      draws: 0,
    }) as Record<string, unknown>;
  const opponent = (content.opponent ??
    content.opponentResponse ?? {
      id: String(content.opponentId ?? ''),
      username: content.opponentUsername ?? '',
      fullName: content.opponentFullName ?? content.opponentDisplayName ?? content.opponentName ?? '',
      avatarColor: '#CCCCCC',
      wins: 0,
      losses: 0,
      draws: 0,
    }) as Record<string, unknown>;
  const proofs = (content.proofs ?? content.proofsList ?? []) as unknown[];
  const status = String(content.status ?? content.betStatus ?? 'INVITED');

  return {
    id: Number(content.id ?? item.id ?? 0),
    title: (content.title ?? content.name ?? '') as string,
    description: (content.description ?? '') as string,
    proofs: proofs as Bet['proofs'],
    buyIn: Number(content.buyIn ?? content.buy_in ?? 0),
    createdAt: content.createdAt as string,
    closedAt: content.closedAt as string,
    expiresAt: content.expiresAt as string,
    status: status as Bet['status'],
    creator: safeUser(creator) as Bet['creator'],
    opponent: safeUser(opponent) as Bet['opponent'],
    group: content.group as Bet['group'],
    deadline: content.deadline as string,
    inviteExpiresAt: content.inviteExpiresAt as string,
  } as Bet & { deadline?: string; inviteExpiresAt?: string };
}

export function mapFeedItemToChallenge(item: FeedItemResponse): Challenge {
  const content = (item.content ?? item) as Record<string, unknown>;
  const challenger = (content.challenger ??
    content.challengerResponse ??
    content.challengerUser) as Record<string, unknown> | undefined;
  const challenged = (content.challenged ??
    content.challengedResponse ??
    content.challengedUser) as Record<string, unknown> | undefined;
  const proof = (content.proof ?? content.proofResponse) as
    | Record<string, unknown>
    | undefined;

  return {
    id: content.id as Challenge['id'],
    challenger: safeUser(challenger, String(content.challengerId ?? '')) as Challenge['challenger'],
    challenged: safeUser(challenged, String(content.challengedId ?? '')) as Challenge['challenged'],
    title: content.title as string,
    description: content.description as string,
    amount: content.amount as number,
    proof: mapProof(proof) as Challenge['proof'],
    createdAt: content.createdAt as string,
    closedAt: content.closedAt as string,
    deadline: content.deadline as string,
    status: content.status as Challenge['status'],
    group: content.group as Challenge['group'],
    inviteExpiresAt: (content.inviteExpiresAt ?? content.expiresAt) as string | undefined,
  } as Challenge & { inviteExpiresAt?: string };
}

export function mapFeedItemToActivity(item: FeedItemResponse): Activity {
  const content = (item.content ?? item) as Record<string, unknown>;
  const author = (content.author ??
    content.authorResponse ??
    content.authorUser) as Record<string, unknown> | undefined;
  const proof = (content.proof ?? content.proofResponse) as
    | Record<string, unknown>
    | undefined;

  return {
    id: Number(content.id ?? item.id ?? 0),
    author: safeUser(author, String(content.authorId ?? '')) as Activity['author'],
    proof: mapProof(proof) as Activity['proof'],
    description: (content.description ?? '') as string,
    status: (content.status ?? 'IN_JUDGMENT') as Activity['status'],
    createdAt: (content.createdAt ?? new Date().toISOString()) as string,
    closedAt: (content.closedAt ?? new Date().toISOString()) as string,
    expiresAt: (content.expiresAt ?? new Date().toISOString()) as string,
    group: content.group as Activity['group'],
  };
}

export function mapFeedItemToBetsTabItem(
  item: FeedItemResponse | any,
): BetsTabItem | null {
  if (item.feedItemType === 'BET') {
    return { ...mapFeedItemToBet(item), feedItemType: 'BET', commentsData: item.comments ?? null, votePercentage: item.votePercentage ?? null };
  }
  if (item.feedItemType === 'CHALLENGE') {
    return { ...mapFeedItemToChallenge(item), feedItemType: 'CHALLENGE', commentsData: item.comments ?? null, votePercentage: item.votePercentage ?? null };
  }
  if (item.feedItemType === 'ACTIVITY') {
    return { ...mapFeedItemToActivity(item), feedItemType: 'ACTIVITY', commentsData: item.comments ?? null, votePercentage: item.votePercentage ?? null };
  }
  return null;
}

export function mapFeedItemsToBetsTabItems(
  items: FeedItemResponse[],
): BetsTabItem[] {
  return items
    .map(mapFeedItemToBetsTabItem)
    .filter((item): item is BetsTabItem => item != null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}
