package com.example.real_time_chat_app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.real_time_chat_app.model.User;
import java.util.Optional;

/** User repository */
public interface UserRepository extends MongoRepository<User, String> {
      Optional<User> findByEmail(String email);
}
