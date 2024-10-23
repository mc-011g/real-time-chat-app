package com.example.real_time_chat_app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** DTO for processing an update to a user's profile information. */
public class UpdateProfileRequestDTO {

    @NotBlank(message = "Id is required")
    @Size(max = 64, message = "Id needs to be less than 64 characters long")
    private String id;

    @NotBlank(message = "Email is required")
    @Email(message = "Email needs to be valid")
    @Size(max = 64, message = "Email needs to be less than 64 characters long")
    private String email;

    /**
     * No validation here because a new password may not be set when saving the
     * profile.
     * If it is set, the validation is handled in the controller.
     */
    private String password;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 20, message = "First name needs to be 2 to 20 characters long")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 20, message = "Last name needs to be 2 to 20 characters long")
    private String lastName;

    @NotBlank(message = "Current password is required")
    @Size(max = 64, message = "Current password needs to be less than 64 characters long")
    private String currentPassword;

    public String getEmail() {
        return email;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getId() {
        return id;
    }

    public String getLastName() {
        return lastName;
    }

    public String getPassword() {
        return password;
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
