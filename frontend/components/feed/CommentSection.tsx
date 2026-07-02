import { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { CommentResponse, ContextType, PaginatedResponse } from '@/lib/types';
import { commentService } from '@/lib/api/comment.service';
import { formatTimeAgo } from '@/lib/utils/formatters';
import { styles } from './BetCard.styles';

interface CommentSectionProps {
  entityType: ContextType;
  entityId: number;
  commentsData: PaginatedResponse<CommentResponse> | null;
}

export function CommentSection({ entityType, entityId, commentsData }: CommentSectionProps) {
  const c = Colors.dark;
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentResponse[]>(commentsData?.content ?? []);
  const [totalComments, setTotalComments] = useState(commentsData?.totalElements ?? 0);
  const [hasNext, setHasNext] = useState(commentsData?.hasNext ?? false);
  const [currentPage, setCurrentPage] = useState(commentsData?.page ?? 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (commentsData) {
      setComments(commentsData.content ?? []);
      setTotalComments(commentsData.totalElements ?? 0);
      setHasNext(commentsData.hasNext ?? false);
      setCurrentPage(commentsData.page ?? 0);
    }
  }, [commentsData]);

  const canSend = commentText.trim().length > 0;

  const toggleComments = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowComments((prev) => !prev);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasNext) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await commentService.getComments(entityType, String(entityId), nextPage, 5);
      setComments((prev) => [...prev, ...result.content]);
      setHasNext(result.hasNext);
      setCurrentPage(result.page);
      setTotalComments(result.totalElements);
    } catch (e) {
      console.error('Failed to load more comments', e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasNext, currentPage, entityType, entityId]);

  const handleSendComment = useCallback(async () => {
    const trimmed = commentText.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    try {
      const newComment = await commentService.addComment(entityType, String(entityId), trimmed);
      setComments((prev) => [newComment, ...prev]);
      setTotalComments((prev) => prev + 1);
      setCommentText('');
    } catch (e) {
      console.error('Failed to send comment', e);
    } finally {
      setIsSending(false);
    }
  }, [commentText, isSending, entityType, entityId]);

  return (
    <>
      <View style={[styles.cardFooter, { borderTopColor: c.border }]}>
        <Pressable style={styles.footerAction} onPress={toggleComments}>
          <Ionicons name="chatbubble-outline" size={18} color={c.textSecondary} />
          <Text style={[styles.footerText, { color: c.textSecondary }]}>{totalComments}</Text>
        </Pressable>
      </View>

      {showComments && (
        <Animated.View entering={FadeIn.duration(200)} style={[styles.commentsSection, { borderTopColor: c.border }]}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Avatar name={comment.authorFullName ?? '?'} color="#CCCCCC" size={24} imageUri={comment.authorProfilePictureUrl} />
              <View style={styles.commentItemContent}>
                <Text style={[styles.commentAuthor, { color: c.text }]}>{comment.authorFullName}</Text>
                {comment.authorUsername && (
                  <Text style={{ color: c.textTertiary, fontSize: 11, marginBottom: 4 }}>@{comment.authorUsername}</Text>
                )}
                <Text style={[styles.commentText, { color: c.textSecondary }]}>{comment.content}</Text>
                {comment.postedAt && (
                  <Text style={[styles.commentTime, { color: c.textTertiary }]}>
                    {formatTimeAgo(comment.postedAt)}
                  </Text>
                )}
              </View>
            </View>
          ))}

          {hasNext && (
            <Pressable
              style={[styles.loadMoreBtn, { backgroundColor: c.surfaceHighlight }]}
              onPress={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <ActivityIndicator size="small" color={c.accent} />
              ) : (
                <Text style={[styles.loadMoreText, { color: c.accent }]}>Carregar mais</Text>
              )}
            </Pressable>
          )}

          <View style={styles.commentInputRow}>
            <TextInput
              style={[
                styles.commentInput,
                {
                  color: c.text,
                  backgroundColor: c.surfaceElevated,
                  borderColor: c.border,
                },
              ]}
              placeholder="Escreva um comentário..."
              placeholderTextColor={c.textTertiary}
              value={commentText}
              onChangeText={setCommentText}
              multiline={false}
              maxLength={500}
            />
            {canSend && (
              <Pressable
                style={[styles.commentSendBtn, { backgroundColor: c.accent }]}
                onPress={handleSendComment}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={16} color="#fff" />
                )}
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </>
  );
}
