package com.ali.chatbotsb.repository;

import com.ali.chatbotsb.model.ChatSession;
import com.ali.chatbotsb.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {

    List<ChatSession> findByUserOrderByUpdatedAtDesc(User user);

    @Query("SELECT cs FROM ChatSession cs WHERE cs.user.id = :userId ORDER BY cs.updatedAt DESC")
    List<ChatSession> findByUserIdOrderByUpdatedAtDesc(@Param("userId") UUID userId);

    @Query("SELECT COUNT(cs) FROM ChatSession cs WHERE cs.user.id = :userId")
    long countByUserId(@Param("userId") UUID userId);
}
