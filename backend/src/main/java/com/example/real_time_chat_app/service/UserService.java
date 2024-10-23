package com.example.real_time_chat_app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.real_time_chat_app.model.User;
import com.example.real_time_chat_app.repository.UserRepository;
import com.example.real_time_chat_app.util.JwtUtil;

/** Handles user related functions. */
@Service
public class UserService {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    /**
     * Creates a new user.
     * 
     * @param user the user to be saved in the database
     */
    public void createUser(User user) {
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    /**
     * Gets all users from the database.
     * 
     * @return a list of all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Retrieves a user by its id.
     * 
     * @param userId the user id
     * @return a user entity
     */
    public Optional<User> findById(String userId) {
        return userRepository.findById(userId);
    }

    /**
     * Retrieves a user by its email.
     * 
     * @param email
     * @return a user entity
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Checks if the authenticated user is in a room
     * 
     * @param roomId the room id
     * @param email  the email from the principal
     * @return true if the user is in the room
     */
    public boolean checkIfInRoom(String roomId, String email) {
        User user = findByEmail(email).get();
        return user.getRooms().contains(roomId);
    }

    /**
     * Checks if a password matches the currently authenticated user's password.
     * 
     * @param password the password to be compared
     * @return true if the password matches, false if it does not
     */
    public boolean checkPasswordMatch(String password) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails currentUser = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(currentUser.getUsername()).get();

        return bCryptPasswordEncoder.matches(password, user.getPassword());
    }

    /**
     * Updates the user's information and reauthenticates them.
     * 
     * @param unsavedUser     the unsaved user
     * @param currentPassword the current password of the user
     * @return a new access token
     */
    public String updateUser(User unsavedUser, String currentPassword) {

        Optional<User> user = findById(unsavedUser.getId());

        if (user.isPresent()) {
            if (unsavedUser.getPassword() != "") {
                user.get().setPassword(bCryptPasswordEncoder.encode(unsavedUser.getPassword()));
            }

            user.get().setFirstName(unsavedUser.getFirstName());
            user.get().setLastName(unsavedUser.getLastName());
            user.get().setEmail(unsavedUser.getEmail());

            User savedUser = userRepository.save(user.get());
            return reauthenticateUser(savedUser, currentPassword);
        } else {
            return "";
        }
    }

    /**
     * Reauthenticates a user by creating a new token due to profile information
     * changes.
     * 
     * @param user            the user
     * @param currentPassword the current password of the user
     * @return a new access token
     */
    public String reauthenticateUser(User user, String currentPassword) {
        UsernamePasswordAuthenticationToken authRequest;

        try {
            authRequest = new UsernamePasswordAuthenticationToken(user.getEmail(),
                    currentPassword);
            authenticationManager.authenticate(authRequest);
        } catch (BadCredentialsException e) {
            try {
                throw new Exception("Invalid email or password", e);
            } catch (Exception e1) {
                e1.printStackTrace();
            }
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        final String accessToken = jwtUtil.generateToken(userDetails.getUsername(), "USER");                                                                           

        return accessToken;
    }

    /**
     * Gets a user by their id
     * 
     * @param id the id of the user
     * @return a user entity
     */
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
}
