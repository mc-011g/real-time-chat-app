package com.example.real_time_chat_app.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.real_time_chat_app.dto.RoomUserDTO;
import com.example.real_time_chat_app.dto.UserRoomDTO;
import com.example.real_time_chat_app.model.Message;
import com.example.real_time_chat_app.model.Room;
import com.example.real_time_chat_app.model.User;
import com.example.real_time_chat_app.repository.RoomRepository;
import com.example.real_time_chat_app.repository.UserRepository;

/** Handles room related functions. */
@Service
public class RoomService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    /**
     * Creates a new room.
     * 
     * @param roomName  the new room name
     * @param userId    the user id of the user creating the room
     * @param userEmail the user email of the user creating the room to set the
     *                  owner
     * @return a new room
     */
    public Room createRoom(String roomName, String userId, String userEmail) {
        Room savedRoom = new Room();
        savedRoom.setName(roomName);
        savedRoom.setUsers(new ArrayList<>());
        savedRoom.setAllUsers(new ArrayList<>());
        savedRoom.setOwner(userEmail);
        roomRepository.save(savedRoom);

        addUserToRoom(savedRoom.getId(), userId);
        addRoomToUser(savedRoom.getId(), userId);

        return savedRoom;
    }

    /**
     * Saves the last message in a room.
     * 
     * @param room the room to be saved with the new message
     */
    public void saveRoomLastMessage(Room room) {
        roomRepository.save(room);
    }

    /**
     * Gets a room with a specific id.
     * 
     * @param id the id of the room
     * @return a Room entity
     */
    public Room getRoomById(String id) {
        return roomRepository.findById(id).orElse(null);
    }

    /**
     * Deletes a room and removes the room from all users that are joined.
     * 
     * @param roomId the room id
     * @param email  the email of the user to check if that is the owner of the room
     * @return true if the room was deleted or false if the room owner's email does
     *         not match the provided email
     */
    public boolean deleteRoom(String roomId, String email) {
        List<User> users = userService.getAllUsers();
        Room room = getRoomById(roomId);

        if (room.getOwner().equals(email)) {
            for (User user : users) {
                if (user.getRooms() != null) {
                    user.getRooms().removeIf(userRoomId -> userRoomId.equals(roomId));
                }
                userRepository.save(user);
            }
            roomRepository.deleteById(roomId);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Adds a user to a room when they accept an invitation.
     * 
     * @param roomId the room id
     * @param userId the user id
     */
    public void addUserToRoom(String roomId, String userId) {
        Room room = getRoomById(roomId);
        List<String> newUserList = new ArrayList<>();
        List<String> newAllUserList = new ArrayList<>();

        if (room != null) {
            if (room.getUsers() != null && room.getAllUsers() != null) {
                newUserList = room.getUsers();
                newAllUserList = room.getAllUsers();
            }
            newUserList.add(userId);

            // Avoid adding duplicate users to this list
            if (!newAllUserList.contains(userId)) {
                newAllUserList.add(userId);
            }

            room.setUsers(newUserList);
            room.setAllUsers(newAllUserList);
            roomRepository.save(room);
        }
    }

    /**
     * Removes a user from the room when they leave it.
     * 
     * @param roomId the room id
     * @param userId the user id
     * @return true if the user was removed, false if not
     */
    public boolean removeUserFromRoom(String roomId, String userId) {
        Room room = getRoomById(roomId);
        User user = userService.findById(userId).get();

        if (room != null && user != null) {
            room.getUsers().remove(userId);
            user.getRooms().remove(roomId);
            roomRepository.save(room);
            userRepository.save(user);
            return true;
        }

        return false;
    }

    /**
     * Get the users in a room.
     * 
     * @param roomId the room id
     * @return a list of the users in the room
     */
    public List<RoomUserDTO> getUsers(String roomId) {
        List<String> users = new ArrayList<>();
        List<RoomUserDTO> roomUsers = new ArrayList<RoomUserDTO>();

        if (getRoomById(roomId).getUsers() != null) {
            users = getRoomById(roomId).getUsers();

            for (String userId : users) {
                User user = userService.findById(userId).get();
                RoomUserDTO newRoomUser = new RoomUserDTO();
                newRoomUser.setId(userId);
                newRoomUser.setFirstName(user.getFirstName());
                newRoomUser.setLastName(user.getLastName());
                newRoomUser.setProfilePictureUrl(user.getProfilePictureURL());
                roomUsers.add(newRoomUser);
            }
        }
        return roomUsers;
    }

    /**
     * Gets all users for a room.
     * 
     * @param roomId the room id
     * @return a list of the room users
     */
    public List<RoomUserDTO> getAllUsers(String roomId) {
        List<String> users = new ArrayList<>();
        List<RoomUserDTO> roomUsers = new ArrayList<RoomUserDTO>();

        if (getRoomById(roomId).getUsers() != null) {
            users = getRoomById(roomId).getAllUsers();

            for (String userId : users) {
                User user = userService.findById(userId).get();
                RoomUserDTO newRoomUser = new RoomUserDTO();

                newRoomUser.setId(userId);
                newRoomUser.setFirstName(user.getFirstName());
                newRoomUser.setLastName(user.getLastName());
                newRoomUser.setProfilePictureUrl(user.getProfilePictureURL());

                roomUsers.add(newRoomUser);
            }
        }
        return roomUsers;
    }

    /**
     * Gets a user's rooms that they are currently joined in.
     * 
     * @param userId the user id
     * @return a list of the user's rooms
     */
    public List<UserRoomDTO> getUserRooms(String userId) {
        List<String> rooms = new ArrayList<>();
        List<UserRoomDTO> userRooms = new ArrayList<UserRoomDTO>();

        if (userService.getUserById(userId).get().getRooms() != null) {
            rooms = userService.getUserById(userId).get().getRooms();

            for (String roomId : rooms) {
                Room room = getRoomById(roomId);
                UserRoomDTO newUserRoom = getUserRoom(roomId);
                User sender = new User();

                newUserRoom.setId(roomId);
                newUserRoom.setName(room.getName());
                newUserRoom.setOwner(room.getOwner());

                if (room.getLastMessageSenderId() != null) {
                    sender = userService.getUserById(room.getLastMessageSenderId()).get();
                    newUserRoom.setLastMessageSenderFirstName(sender.getFirstName());
                }

                newUserRoom.setLastMessageSenderId(room.getLastMessageSenderId());
                newUserRoom.setLastMessage(room.getLastMessage());
                userRooms.add(newUserRoom);

            }
        }
        return userRooms;

    }

    /**
     * Gets a user's room.
     * 
     * @param roomId the room id
     * @return an object of the user's room
     */
    public UserRoomDTO getUserRoom(String roomId) {
        Room room = getRoomById(roomId);

        if (room != null) {
            UserRoomDTO userRoom = new UserRoomDTO();
            userRoom.setId(roomId);
            userRoom.setName(room.getName());
            userRoom.setOwner(room.getOwner());

            String[] lastMessageInformation = getRoomLastMessageInformation(roomId);
            if (lastMessageInformation.length > 0) {
                userRoom.setLastMessage(lastMessageInformation[0]);
                userRoom.setLastMessageSenderId(lastMessageInformation[1]);
                userRoom.setLastMessageSenderFirstName(lastMessageInformation[2]);
            }

            return userRoom;
        } else {
            return null;
        }
    }

    /**
     * Gets the information for the last message sent in a room.
     * 
     * @param roomId the room id
     * @return a string array with message information or an empty string array if
     *         there are no messages in the room
     */
    public String[] getRoomLastMessageInformation(String roomId) {

        List<Message> messages = messageService.getMessagesByRoomId(roomId);

        if (messages.size() != 0) {
            Message lastMessage = messages.get(messages.size() - 1);
            String lastMessageSenderId = lastMessage.getSenderId();
            String lastMessageSenderFirstName = lastMessage.getSenderFirstName();
            return new String[] { lastMessage.getContent(), lastMessageSenderId, lastMessageSenderFirstName };
        } else {
            return new String[0];
        }
    }

    /**
     * Adds a room to a user after accepting an invitation.
     * 
     * @param roomId the room id
     * @param userId the user id
     */
    public void addRoomToUser(String roomId, String userId) {
        User user = userService.getUserById(userId).get();
        Room room = getRoomById(roomId);

        List<String> newRoomList = new ArrayList<>();

        if (user != null && room != null) {
            if (user.getRooms() != null) {
                newRoomList = user.getRooms();
            }
            newRoomList.add(roomId);
            user.setRooms(newRoomList);
            userRepository.save(user);
        }
    }

    /**
     * Changes the name of a room.
     * 
     * @param roomId  the room id
     * @param email   the email to check the owner's email of the room
     * @param newName the new name of the room
     * @return true if the new room name was set and false if it was not
     */
    public boolean changeRoomName(String roomId, String email, String newName) {
        Room room = getRoomById(roomId);

        if (room != null && room.getOwner().equals(email)) {
            room.setName(newName);
            roomRepository.save(room);
            return true;
        } else {
            return false;
        }
    }
}
