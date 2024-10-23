package com.example.real_time_chat_app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.real_time_chat_app.model.Message;
import com.example.real_time_chat_app.repository.MessageRepository;

/** Handles message related functions. */
@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    /**
     * Creates a new message.
     * 
     * @param message the message to be created in the database
     * @return a message entity
     */
    public Message createMessage(Message message) {
        return messageRepository.save(message);
    }

    /**
     * Retrieves the messages in a specific room.
     * 
     * @param roomId the room's id
     * @return a list of messages
     */
    public List<Message> getMessagesByRoomId(String roomId) {
        return messageRepository.findByRoomId(roomId);
    }
}
