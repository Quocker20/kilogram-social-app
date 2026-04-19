package com.kilogram.backendcore.repository;

import com.kilogram.backendcore.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {

    @Query("SELECT c FROM Conversation c WHERE (c.user1.id = :user1Id AND c.user2.id = :user2Id) OR (c.user1.id = :user2Id AND c.user2.id = :user1Id)")
    Optional<Conversation> findConversationBetweenUsers(@Param("user1Id") String user1Id, @Param("user2Id") String user2Id);

    @Query("SELECT c FROM Conversation c WHERE c.user1.id = :userId OR c.user2.id = :userId ORDER BY c.lastMessageAt DESC")
    Page<Conversation> findUserConversations(@Param("userId") String userId, Pageable pageable);
}
