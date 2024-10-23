package com.example.real_time_chat_app.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.real_time_chat_app.model.Message;

/** Message repository */
public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByRoomId(String id);
}
