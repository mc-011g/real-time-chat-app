package com.example.real_time_chat_app.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** The user model. */
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @NotBlank(message = "Email is required")
    @Email(message = "Email needs to be valid")
    @Size(max = 64, message = "Email needs to be less than 64 characters long")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64, message = "Password needs to be 8 to 64 characters long")
    private String password;

    @Size(max = 50, message = "A user cannot join more than 100 rooms")
    private List<String> rooms;

    @NotBlank(message = "Role is required")
    @Size(max = 64, message = "Role cannot be more than 30 characters long")
    private String role;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 20, message = "First name needs to be 2 to 20 characters long")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 20, message = "Last name name needs to be 2 to 20 characters long")
    private String lastName;

    private String profilePictureURL;

    public String getId() {
        return id;
    }

    public String getProfilePictureURL() {
        return profilePictureURL;
    }

    public void setProfilePictureURL(String profilePictureURL) {
        this.profilePictureURL = profilePictureURL;
    }

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

    public List<String> getRooms() {
        return rooms;
    }

    public String getRole() {
        return role;
    }

    public void setId(String id) {
        this.id = id;
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

    public void setRooms(List<String> rooms) {
        this.rooms = rooms;
    }

    public void setRole(String role) {
        this.role = role;
    }

}
