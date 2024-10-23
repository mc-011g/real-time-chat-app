package com.example.real_time_chat_app.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.example.real_time_chat_app.model.Invitation;
import com.example.real_time_chat_app.model.Room;
import com.example.real_time_chat_app.model.User;
import com.example.real_time_chat_app.repository.InvitationRepository;

/** Handles invitation related functions. */
@Service
public class InvitationService {

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private RoomService roomService;

    @Autowired
    private UserService userService;

    @Value("${react.app.base.url}")
    private String reactAppBaseURL;

    /**
     * Generates a new invitation link.
     * 
     * @param roomId the room id that the invitation was created for
     * @return an invitation link
     */
    public String generateInvitationLink(String roomId) {

        String token = UUID.randomUUID().toString();
        String invitationLink = reactAppBaseURL + "/join?token=" + token;

        Invitation newInvitation = new Invitation();
        newInvitation.setToken(token);
        newInvitation.setRoomId(roomId);
        newInvitation.setUsed(false);
        invitationRepository.save(newInvitation);

        return invitationLink;
    }

    /**
     * Accepts an invitation to join a room.
     * 
     * @param token  the invitation token
     * @param userId the user id of the user who is accepting the invitaiton
     * @return a room or null
     */
    public Room acceptInvitation(String token, String userId) {
        Invitation invitation = invitationRepository.findByToken(token).get();
        Room room = roomService.getRoomById(invitation.getRoomId());
        User user = userService.getUserById(userId).get();

        if (invitation != null && !invitation.getUsed()
                && (user.getRooms() == null || !(user.getRooms().contains(room.getId())))) {
            roomService.addUserToRoom(room.getId(), userId);
            roomService.addRoomToUser(room.getId(), userId);
            invitation.setUsed(true);
            invitationRepository.save(invitation);
            return room;
        } else {
            return null;
        }
    }

}
