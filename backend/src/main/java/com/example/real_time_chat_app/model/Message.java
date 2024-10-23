package com.example.real_time_chat_app.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.format.annotation.DateTimeFormat;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** The message model. */
@Document(collection = "messages")
public class Message {

    @Id
    private String id;

    @NotBlank(message = "Message cannot be empty")
    @Size(max = 1000, message = "Message cannot be longer than 1000 characters")
    private String content;

    @DateTimeFormat
    private LocalDateTime timestamp;

    @NotBlank(message = "Sender id required")
    @Size(max = 64, message = "Sender id needs to be up to 64 characters long")
    private String senderId;

    @NotBlank(message = "Sender email is required")
    @Email(message = "Sender email needs to be valid")
    @Size(max = 64, message = "Sender email needs to be up to 64 characters long")
    private String senderEmail;

    @NotBlank(message = "Sender first name is required")
    @Size(max = 64, message = "Sender first name is required")
    private String senderFirstName;

    @NotBlank(message = "Sender last name is required")
    @Size(max = 64, message = "Sender last name is required")
    private String senderLastName;

    @NotBlank(message = "Room id required")
    @Size(max = 64, message = "Room id needs to be up to 64 characters long")
    private String roomId;

    @NotBlank(message = "Type is required")
    @Size(max = 20, message = "Type needs to be up to 20 characters long")
    private String type = "message";

    public void setType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }

    public String getId() {
        return id;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getSenderFirstName() {
        return senderFirstName;
    }

    public String getSenderLastName() {
        return senderLastName;
    }

    public void setSenderFirstName(String senderFirstName) {
        this.senderFirstName = senderFirstName;
    }

    public void setSenderLastName(String senderLastName) {
        this.senderLastName = senderLastName;
    }

}
