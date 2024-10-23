package com.example.real_time_chat_app.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.real_time_chat_app.dto.LoginDTO;
import com.example.real_time_chat_app.dto.UpdateProfileRequestDTO;
import com.example.real_time_chat_app.dto.UserRegistrationDTO;
import com.example.real_time_chat_app.model.User;
import com.example.real_time_chat_app.service.RoomService;
import com.example.real_time_chat_app.service.UserService;
import com.example.real_time_chat_app.util.AuthenticationResponse;
import com.example.real_time_chat_app.util.JwtUtil;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/** User controller */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private RoomService roomService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Registers a new user for the app.
     * 
     * @param userRegistrationDTO the dto for user registration
     * @return a ResponseEntity with a message to indicate a successful registration
     * @throws Exception
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDTO userRegistrationDTO)
            throws Exception {

        if (!userService.findByEmail(userRegistrationDTO.getEmail()).isPresent()) {
            User user = new User();

            user.setRole("USER");
            user.setEmail(userRegistrationDTO.getEmail());
            user.setPassword(userRegistrationDTO.getPassword());
            user.setFirstName(userRegistrationDTO.getFirstName());
            user.setLastName(userRegistrationDTO.getLastName());
            userService.createUser(user);

            return ResponseEntity.ok("User has been registered successfully.");
        }
        throw new Exception("A user is already registered with this email address.");
    }

    /**
     * Authenticates the user.
     * 
     * @param loginDTO the dto for the login
     * @return an authentication response that includes the access token
     * @throws Exception when the user fails to authenticate if the email or
     *                   password is incorrect
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) throws Exception {
        try {
            authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(loginDTO.getEmail(),
                            loginDTO.getPassword()));
        } catch (BadCredentialsException e) {
            throw new Exception("Invalid email or password", e);
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginDTO.getEmail());
        final String accessToken = jwtUtil.generateToken(userDetails.getUsername(), "USER");

        return ResponseEntity.ok(new AuthenticationResponse(accessToken));
    }

    /**
     * Gets user information for the currently authenticated user.
     * 
     * @param principal the currently authenticated user
     * @return a ResponseEntity with a user object to provide user information
     */
    @GetMapping("/userProfile")
    public ResponseEntity<User> getUserProfile(Principal principal) {
        return ResponseEntity.ok(userService.findByEmail(principal.getName()).get());
    }

    /**
     * Updates the user information for the currently authenticated user when a user
     * changes their profile information.
     * 
     * @param profileDataDTO the dto for changing profile information
     * @return a ResponseEntity with an authentication response including the access
     *         token, or an unauthorized status code if the current password is
     *         incorrect, or a bad request indicating the profile failed to save
     */
    @PutMapping("/saveUserProfile")
    public ResponseEntity<?> saveUserProfile(@Valid @RequestBody UpdateProfileRequestDTO profileDataDTO,
            Principal principal) {

        String currentUserId = userService.findByEmail(principal.getName()).get().getId();

        if (profileDataDTO.getCurrentPassword() != "" && profileDataDTO.getId().equals(currentUserId)) {
            if (userService.checkPasswordMatch(profileDataDTO.getCurrentPassword())) {
                User unsavedUser = new User();
                unsavedUser.setId(profileDataDTO.getId());
                unsavedUser.setEmail(profileDataDTO.getEmail());
                unsavedUser.setFirstName(profileDataDTO.getFirstName());
                unsavedUser.setLastName(profileDataDTO.getLastName());

                String newPassword = profileDataDTO.getPassword();

                // Password in the form cannot be an empty string for it to be changed
                if (!newPassword.equals("")) {
                    if (newPassword.length() >= 8 && newPassword.length() <= 64) {
                        unsavedUser.setPassword(newPassword);
                    } else {
                        Map<String, String> error = new HashMap<>();
                        error.put("password", "Password needs to be 8 to 64 characters long");
                        return ResponseEntity.badRequest().body(error);
                    }
                } else {
                    // Reuse the same password if a new password was not set
                    unsavedUser.setPassword(profileDataDTO.getCurrentPassword());
                }

                String accessToken = userService.updateUser(unsavedUser, profileDataDTO.getCurrentPassword());
                messagingTemplate.convertAndSend("/topic/user/update", profileDataDTO);
                return ResponseEntity.ok(new AuthenticationResponse(accessToken));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
            }
        } else {
            return ResponseEntity.badRequest().body("Profile was not saved. Current password is required.");
        }
    }

    /**
     * Gets the rooms for a user.
     * 
     * @param userId the user's id
     * @return a ResponseEntity with a list of the user's rooms
     */
    @GetMapping("/rooms")
    public ResponseEntity<?> getRooms(Principal principal) {
        if (principal != null) {
            String userId = userService.findByEmail(principal.getName()).get().getId();
            return ResponseEntity.ok(roomService.getUserRooms(userId));
        } else {
            return ResponseEntity.badRequest().body("Failed to get rooms.");
        }
    }

    /**
     * Checks if the currently authenticated user has a room.
     * 
     * @param roomId    the room id
     * @param principal the currently authenticated user
     * @return true if the user has the room
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<?> userHasRooms(@PathVariable String roomId, Principal principal) {
        if (userService.checkIfInRoom(roomId, principal.getName())) {
            return ResponseEntity.ok(true);
        } else {
            return ResponseEntity.badRequest().body("Failed to check if user is in room.");
        }
    }
}
