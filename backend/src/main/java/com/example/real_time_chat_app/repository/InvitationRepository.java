package com.example.real_time_chat_app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.real_time_chat_app.model.Invitation;
import java.util.Optional;

/** Invitation repository */
public interface InvitationRepository extends MongoRepository<Invitation, String> {
    Optional<Invitation> findByToken(String token);
}