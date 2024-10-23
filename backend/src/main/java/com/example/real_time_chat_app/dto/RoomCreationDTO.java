package com.example.real_time_chat_app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** DTO for creating a room. */
public class RoomCreationDTO {

    @NotBlank(message = "Room name is required")
    @Size(max = 64, message = "Room name needs to be up to 64 characters long")
    private String roomName;

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }
}
