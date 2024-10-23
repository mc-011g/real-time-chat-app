package com.example.real_time_chat_app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** DTO for registering a new user. */
public class UserRegistrationDTO {
    @NotBlank(message = "Email is required")
    @Email(message = "Email needs to be valid")
    @Size(max = 64, message = "Email needs to be less than 64 characters long")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64, message = "Password needs to be 8 to 64 characters long")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 20, message = "First name needs to be 2 to 20 characters long")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 20, message = "Last name needs to be 2 to 20 characters long")
    private String lastName;

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
