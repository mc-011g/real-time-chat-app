package com.example.real_time_chat_app.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.real_time_chat_app.dto.RoomCreationDTO;
import com.example.real_time_chat_app.dto.RoomUserDTO;
import com.example.real_time_chat_app.dto.UserRoomDTO;
import com.example.real_time_chat_app.model.Message;
import com.example.real_time_chat_app.model.Room;
import com.example.real_time_chat_app.model.User;
import com.example.real_time_chat_app.service.InvitationService;
import com.example.real_time_chat_app.service.RoomService;
import com.example.real_time_chat_app.service.UserService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;

/** Room controller */
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private UserService userService;

    @Autowired
    private InvitationService invitationService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Creates a new room for a user.
     * 
     * @param roomCreationDTO the dto for creating a room
     * @param principal       the currently authenticated user
     * @return ResponseEntity with a new room or a bad request if the room cannot be
     *         created
     */
    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@Valid @RequestBody RoomCreationDTO roomCreationDTO, Principal principal) {

        User user = userService.findByEmail(principal.getName()).get();
        if (user != null) {
            return ResponseEntity
                    .ok(roomService.createRoom(roomCreationDTO.getRoomName(), user.getId(), user.getEmail()));
        } else {
            return ResponseEntity.badRequest().body("Failed to create room");
        }
    }

    /**
     * Gets a room based on the room id.
     * 
     * @param roomId    the room id
     * @param principal the currently authenticated user
     * @return ResponseEntity with ether an 401 status code or a room
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRoom(@PathVariable String roomId, Principal principal) {

        Room room = roomService.getRoomById(roomId);

        if (!userService.checkIfInRoom(roomId, principal.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } else {
            return ResponseEntity.ok(room);
        }
    }

    /**
     * Retrieves the currently joined users in a room to refresh the participants
     * when a user joins or leaves a group.
     * 
     * @param roomId the room id
     * @return a list of users
     */
    @MessageMapping("/updateUsers/{roomId}")
    @SendTo("/topic/room/{roomId}/users")
    public List<RoomUserDTO> updateUsers(@DestinationVariable String roomId, Principal principal) {
        return roomService.getUsers(roomId);
    }

    /**
     * Retrieves all users in a room to update the history of all users who join
     * that room.
     * 
     * @param roomId the room id
     * @return a list of all users who have joined that room
     */
    @MessageMapping("/updateAllUsers/{roomId}")
    @SendTo("/topic/room/{roomId}/users/all")
    public List<RoomUserDTO> updateAllUsers(@DestinationVariable String roomId, Principal principal) {
        return roomService.getAllUsers(roomId);
    }

    /**
     * Updates the last message for a room.
     * 
     * @param roomId  the room id
     * @param message the message being sent
     * @return a user room dto if the room exists or an empty room if it does not
     *         exist
     */
    @MessageMapping("/updateRoomLastMessage/{roomId}")
    @SendTo("/topic/rooms")
    public UserRoomDTO updateRoomLastMessage(@DestinationVariable String roomId,
            @Payload Message message, Principal principal) {

        Room room = roomService.getRoomById(roomId);

        if (room != null && userService.checkIfInRoom(roomId, principal.getName())) {
            room.setLastMessageSenderFirstName(message.getSenderFirstName());
            room.setLastMessageSenderId(message.getSenderId());
            room.setLastMessage(message.getContent());
            roomService.saveRoomLastMessage(room);

            UserRoomDTO userRoom = roomService.getUserRoom(roomId);
            userRoom.setLastMessage(message.getContent());
            userRoom.setLastMessageSenderFirstName(message.getSenderFirstName());
            userRoom.setLastMessageSenderId(message.getSenderId());

            return roomService.getUserRoom(roomId);
        } else {
            return null;
        }
    }

    /**
     * Gets the currently joined users for a room.
     * 
     * @param roomId the room id
     * @return a list of users for the room
     */
    @GetMapping("/{roomId}/users")
    public ResponseEntity<?> getUsers(@PathVariable String roomId, Principal principal) {
        if (userService.checkIfInRoom(roomId, principal.getName())) {
            return ResponseEntity.ok(roomService.getUsers(roomId));
        } else {
            return ResponseEntity.badRequest().body("Failed to get users.");
        }
    }

    /**
     * Gets all users who have ever joined a room.
     * 
     * @param roomId the room id
     * @return a ResponseEntity with a list of all users in the room
     */
    @GetMapping("/{roomId}/users/all")
    public ResponseEntity<?> getAllUsers(@PathVariable String roomId, Principal principal) {
        if (userService.checkIfInRoom(roomId, principal.getName())) {
            return ResponseEntity.ok(roomService.getAllUsers(roomId));
        } else {
            return ResponseEntity.badRequest().body("Failed to get all users.");
        }
    }

    /**
     * Generates a new invitation link to send to other users.
     * 
     * @param roomId the room id
     * @return a ResponseEntity with either a new invitation link or a bad request
     *         if there is a failure to create it
     */
    @PostMapping("/{roomId}/invite")
    public ResponseEntity<?> createInvitationLink(@PathVariable String roomId, Principal principal) {

        if ((!roomId.equals("undefined") && !roomId.isEmpty() && roomId != null) && principal != null) {
            String invitationLink = invitationService.generateInvitationLink(roomId);
            return ResponseEntity.ok(invitationLink);
        } else {
            return ResponseEntity.badRequest().body("Failed to create invitation.");
        }

    }

    /**
     * Joins a room when a user accepts an invitation.
     * 
     * @param token     the token that was generated for a new invitation
     * @param principal the currently authenticated user
     * @return a ResponseEntity with either the new room that was joined, or a bad
     *         request if the room cannot be joined, or an unauthorized status code
     *         if the user is not authenticated or if there is no token
     */
    @GetMapping("/join")
    public ResponseEntity<?> joinRoom(@RequestParam String token, Principal principal) {
        String userId = userService.findByEmail(principal.getName()).get().getId();

        if (principal != null && token != null) {
            Room joinedRoom = invitationService.acceptInvitation(token, userId);

            if (joinedRoom != null) {
                return ResponseEntity.ok(joinedRoom);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token");
            }
        } else {
            return ResponseEntity.badRequest().body("User is not authenticated or token doesn't exist");
        }
    }

    /**
     * Leaves a room.
     * 
     * @param roomId    the room id
     * @param principal the currently authenticated user
     * @return a ResponseEntity with a message indictating that the user left the
     *         room or a 404 status code
     */
    @GetMapping("/{roomId}/leave")
    public ResponseEntity<?> leaveRoom(@PathVariable String roomId, Principal principal) {
        Room room = roomService.getRoomById(roomId);

        if (!room.getOwner().equals(principal.getName())) {
            boolean leftRoom = roomService.removeUserFromRoom(roomId,
                    userService.findByEmail(principal.getName()).get().getId());
            if (leftRoom) {
                return ResponseEntity.ok("Room left");
            }
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to leave room.");
    }

    /**
     * Deletes a room.
     * 
     * @param roomId    the room id
     * @param principal the currently authenticated user
     * @return a ResponseEntity with a message that the user was deleted or a bad
     *         request if there was a failure to delete the room
     */
    @DeleteMapping("/{roomId}")
    public ResponseEntity<?> deleteRoom(@PathVariable String roomId, Principal principal) {

        if (principal != null) {
            User user = userService.findByEmail(principal.getName()).get();

            if (roomId != null && user.getRooms().contains(roomId)) {
                UserRoomDTO room = roomService.getUserRoom(roomId);
                room.setType("userRoomDelete");

                boolean deletedRoom = roomService.deleteRoom(roomId, principal.getName());

                if (deletedRoom) {
                    messagingTemplate.convertAndSend("/topic/room/delete", room);
                    return ResponseEntity.ok("Room deleted");
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to delete room");
                }
            } else {
                return ResponseEntity.badRequest().body("Failed to delete room.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not authenticated");
        }
    }

    /**
     * Changes a room's name.
     * 
     * @param roomId    the room id
     * @param newName   the new name for the room
     * @param principal the currently authenticated user
     * @return a ResponseEntity with a message that the room name was changed or a
     *         bad request if the change failed
     */
    @PutMapping("/{roomId}")
    public ResponseEntity<?> changeRoomName(@PathVariable String roomId, @RequestParam String newName,
            Principal principal) {

        if ((roomId != null && !newName.isEmpty()) && userService.checkIfInRoom(roomId, principal.getName())) {
            UserRoomDTO room = roomService.getUserRoom(roomId);
            room.setName(newName);

            boolean changedRoomName = roomService.changeRoomName(roomId, principal.getName(), newName);

            if (changedRoomName) {
                messagingTemplate.convertAndSend("/topic/rooms", room);
                return ResponseEntity.ok("Room name changed");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to change room name");
            }
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to change room name");
        }
    }

}
