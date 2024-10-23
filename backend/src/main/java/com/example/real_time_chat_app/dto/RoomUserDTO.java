package com.example.real_time_chat_app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** DTO for a user in a room. */
public class RoomUserDTO {

    @NotBlank(message = "Id is required")
    @Size(max = 64, message = "Id needs to be up to 64 characters long")
    private String id;

    @NotBlank(message = "First name is required")
    @Size(max = 64, message = "First name needs to be up to 64 characters long")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 64, message = "Last name needs to be up to 64 characters long")
    private String lastName;

    private String profilePictureUrl;

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setId(String id) {
        this.id = id;
    }

}
