package com.api.betdobem.repositories;

import com.api.betdobem.domain.Friendship;
import com.api.betdobem.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    @Query("SELECT COUNT(f) > 0 FROM Friendship f WHERE (f.user.id = :userId AND f.friend.id = :friendId) OR (f.user.id = :friendId AND f.friend.id = :userId)")
    boolean existsFriendship(@Param("userId") Long userId, @Param("friendId") Long friendId);

    long countByUserIdOrFriendId(Long userId, Long friendId);

    @Query("""
    SELECT u FROM User u 
    WHERE u.id IN (SELECT f.friend.id FROM Friendship f 
                        WHERE f.user.id = :userId) 
    OR u.id IN (SELECT f.user.id FROM Friendship f 
                        WHERE f.friend.id = :userId)""")
    Page<User> findFriendsByUserId(@Param("userId") Long userId, Pageable pageable);
}
