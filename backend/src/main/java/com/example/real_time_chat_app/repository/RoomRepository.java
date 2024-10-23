package com.example.real_time_chat_app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.real_time_chat_app.model.Room;

/** Room repository */
public interface RoomRepository extends MongoRepository<Room, String> {
}
