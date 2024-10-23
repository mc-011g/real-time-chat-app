package com.example.real_time_chat_app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** The invitation model. */
@Document(collection = "invitations")
public class Invitation {

    @Id
    private String id;

    @NotBlank(message = "Token is required")
    @Size(max = 1000, message = "Token length must be up to 1000 characters in length")
    private String token;

    @NotBlank(message = "Room id is required")
    @Size(max = 1000, message = "Room id length must be up to 100 characters in length")
    private String roomId;

    @NotNull
    private boolean isUsed;

    public String getId() {
        return id;
    }

    public String getRoomId() {
        return roomId;
    }

    public String getToken() {
        return token;
    }

    public boolean getUsed() {
        return isUsed;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setUsed(boolean isUsed) {
        this.isUsed = isUsed;
    }

}
