package com.example.real_time_chat_app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** DTO for a user's room. */
public class UserRoomDTO {

    @NotBlank(message = "Id is required")
    @Size(max = 64, message = "Id needs to be up to 64 characters long")
    private String id;

    @NotBlank(message = "Name is required")
    @Size(max = 64, message = "Name needs to be up to 64 characters long")
    private String name;

    @NotBlank(message = "Last message content is required")
    @Size(max = 1000, message = "Last message content needs to be a maximum of 1000 characters long")
    private String lastMessage;

    @NotBlank(message = "Last message sender id is required")
    @Size(max = 64, message = "Last message sender id needs to be 2 to 64 characters long")
    private String lastMessageSenderId;

    @NotBlank(message = "Sender first name is required")
    @Size(min = 2, max = 20, message = "Sender first name needs to be 2 to 20 characters long")
    private String lastMessageSenderFirstName;

    @NotBlank(message = "Owner email is required")
    @Size(max = 64, message = "Owner email to be up to 64 characters long")
    @Email(message = "Owner email needs to be valid")
    private String owner;

    @NotBlank(message = "Type is required")
    @Size(max = 20, message = "Type needs to be up to 20 characters long")
    private String type = "userRoom";

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getLastMessageSenderFirstName() {
        return lastMessageSenderFirstName;
    }

    public void setLastMessageSenderFirstName(String lastMessageSenderFirstName) {
        this.lastMessageSenderFirstName = lastMessageSenderFirstName;
    }

    public String getLastMessageSenderId() {
        return lastMessageSenderId;
    }

    public void setLastMessageSenderId(String lastMessageSenderId) {
        this.lastMessageSenderId = lastMessageSenderId;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

}
