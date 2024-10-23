package com.example.real_time_chat_app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** DTO for use with a login request. */
public class LoginDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Email needs to be valid")
    @Size(max = 64, message = "Email needs to be less than 64 characters long")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64, message = "Password needs to be 8 to 64 characters long")
    private String password;

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
