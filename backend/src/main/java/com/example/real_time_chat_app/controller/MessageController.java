package com.example.real_time_chat_app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.real_time_chat_app.model.Message;
import com.example.real_time_chat_app.service.MessageService;
import com.example.real_time_chat_app.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.security.Principal;
import java.time.LocalDateTime;

/** Message controller. */
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    /**
     * Creates and sends a new message to a room.
     * 
     * @param roomId    the room id where the message was sent from
     * 
     * @param message   the message the user is sending
     * 
     * @param principal the currently authenticated user
     * 
     * @return a new Message object
     */
    @MessageMapping("/chat.sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(@DestinationVariable String roomId,
            @Valid @Payload Message message,
            Principal principal) {

        if (userService.checkIfInRoom(roomId, principal.getName())) {
            message.setTimestamp(LocalDateTime.now());
            return messageService.createMessage(message);
        } else {
            return null;
        }
    }

    /**
     * Retrieves messages for a specific room.
     * 
     * @param roomId the room id
     * @return ResponseEntity with a list of messages
     */
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<?> getMessagesByRoomId(@PathVariable String roomId, Principal principal) {
        if (userService.checkIfInRoom(roomId, principal.getName())) {
            return ResponseEntity.ok(messageService.getMessagesByRoomId(roomId));
        } else {
            return ResponseEntity.badRequest().body("Failed to get messages.");
        }
    }

}
