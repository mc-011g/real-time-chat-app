import { useContext, useEffect, useRef, useState } from "react";
import { fetchMessages } from "../services/fetchMessages";
import { getToken } from "../services/jwtUtils";
import { fetchRoomUsers } from "../services/fetchRoomUsers";
import { CustomToolTip } from "./CustomToolTip";
import { useLocation, useNavigate } from "react-router-dom";
import { WebSocketClientContext } from "../context/WebSocketClientContext";
import { fetchAllRoomUsers } from "../services/fetchAllRoomUsers";
import logger from "../services/logger.js";

const MessageList = ({ roomId, locationState, deleteRoom, user, setUser, updateRoomInfo }) => {
    const [sendMessageContent, setSendMessageContent] = useState('');
    const messagesEndRef = useRef(null);
    const prevRoomIdRef = useRef(null);
    const token = getToken();
    const location = useLocation();
    const navigate = useNavigate();
    const subscriptionsMade = useRef(false);

    const { subscribeToRoom, subscribeToRoomParticipants,
        deletedRoom, setDeletedRoom, messages, setMessages,
        publishMessage, unsubscribeFromRoom, setSubscribeWithRoomId,
        connected, updateRoomParticipants, setUpdatedUserProfile, subscribeToAllRoomParticipants,
        updatedUserProfile, roomUsers, setRoomUsers, allRoomUsers, setAllRoomUsers
    } = useContext(WebSocketClientContext);

    useEffect(() => {
        if (roomId && connected && token) {
            const getMessages = async () => {
                try {
                    const messages = await fetchMessages(roomId);
                    setMessages(messages);
                } catch (error) {
                    logger.debug('Error fetching messages: ', error);
                }
            };
            getMessages();

            const getRoomUsers = async () => {
                try {
                    const fetchedRoomUsers = await fetchRoomUsers(roomId);
                    setRoomUsers(fetchedRoomUsers);
                } catch (error) {
                    logger.debug('Error fetching users in the room: ', error);
                }
            }
            getRoomUsers();

            const getAllRoomUsers = async () => {
                try {
                    const fetchedAllRoomUsers = await fetchAllRoomUsers(roomId);
                    setAllRoomUsers(fetchedAllRoomUsers);
                } catch (error) {
                    logger.debug('Error fetching all users in the room: ', error);
                }
            }
            getAllRoomUsers();
        } else {
            setMessages([]);
        }
    }, [roomId, token, setMessages, setRoomUsers, setAllRoomUsers, connected]);

    //Makes room specific subscriptions when the room changes
    useEffect(() => {
        if (connected) {
            if (roomId && token) {
                if (prevRoomIdRef.current) {
                    unsubscribeFromRoom(prevRoomIdRef.current);
                }
                prevRoomIdRef.current = roomId;
                setSubscribeWithRoomId(roomId); //Used for making room subscriptions
                subscriptionsMade.current = true;
            }
        }
    }, [roomId, token, subscribeToAllRoomParticipants, subscribeToRoom, subscribeToRoomParticipants, unsubscribeFromRoom, connected, setSubscribeWithRoomId])

    //Updates the room users when a user updates their profile information.  
    useEffect(() => {
        if (updatedUserProfile && user) {
            if (user.id === updatedUserProfile.id) {
                setUser(user);
            }

            const updateRoomUsers = (users) => {
                const updatedRoomUsers = users.map(user => {
                    if (user.id === updatedUserProfile.id) {
                        return updatedUserProfile;
                    } else {
                        return user;
                    }
                }
                );
                return updatedRoomUsers;
            }

            setRoomUsers(updateRoomUsers(roomUsers));
            setAllRoomUsers(updateRoomUsers(allRoomUsers));

            //Set to null to only use it once
            setUpdatedUserProfile(null);
        }
    }, [setUpdatedUserProfile, updatedUserProfile, user, setUser, messages, setMessages, updateRoomInfo, roomId, roomUsers, setRoomUsers, setAllRoomUsers, allRoomUsers]);

    // Updates room participants when a user accepts an invite to join a room and when the client connects
    useEffect(() => {
        if (locationState.joinedRoomId && connected) {
            updateRoomParticipants(roomId);
            navigate(location.pathname, { state: { ...locationState, joinedRoomId: undefined } }); //Clears joined room value after using it
        }
    }, [locationState.joinedRoomId, locationState, location.pathname, navigate, updateRoomParticipants, roomId, connected]);

    // Deletes room 
    useEffect(() => {
        if (deletedRoom && connected === true) {
            deleteRoom(deletedRoom.id);
            setDeletedRoom(null);
        }
    }, [connected, deleteRoom, deletedRoom, setDeletedRoom]);

    const sendMessage = () => {
        if (sendMessageContent && user.firstName && user.id) {
            publishMessage(roomId, sendMessageContent, user.id,
                user.firstName, user.lastName, user.email);
            setSendMessageContent('');
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && sendMessageContent) {
            sendMessage();
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const options = { hour: 'numeric', minute: 'numeric', hour12: true }
        const formattedTime = date.toLocaleTimeString('en-US', options);

        return <small>{formattedTime}</small>;
    }

    const getMessageUserName = (message) => {
        if (message.senderId !== user?.id) {
            let userName = allRoomUsers?.find(user => user.id === message.senderId);
            return userName?.firstName + ' ' + userName?.lastName;
        } else {
            return '';
        }
    }

    const checkIfSameUserForPreviousMessage = (message, index) => {
        return (messages[index - 1] && (messages[index - 1].senderId === messages[index].senderId) ? true : false);
    }

    return (
        <>
            <div className="h-100 d-flex flex-column overflow-y-scroll mt-3 mb-3">
                {messages.map((message, index) => (
                    <div className={`${checkIfSameUserForPreviousMessage(message, index) ? "mt-1" : "mt-3"}`}>
                        <div className={`${message.senderId === user?.id ? 'sentMessageContainer' : 'receivedMessageContainer'}`} key={message.Id}>

                            {message.senderId !== user?.id &&
                                <>
                                    {!checkIfSameUserForPreviousMessage(message, index) ?
                                        <div className="roomListImage userListImage">
                                            {message.senderFirstName.charAt(0) + message.senderLastName.charAt(0)}
                                        </div>
                                        :
                                        <div className="roomListImageEmpty mt-3"></div>
                                    }
                                </>
                            }
                            <div className={`${message.senderId === user?.id ? 'sentMessage' : 'receivedMessage'}`}>
                                <div>
                                    {message.senderId !== user?.id &&
                                        <>
                                            {!checkIfSameUserForPreviousMessage(message, index) &&
                                                <b className="me-2">
                                                    {getMessageUserName(message)}
                                                </b>
                                            }
                                        </>
                                    }
                                    {formatTime(message.timestamp)}
                                </div>
                                <div>{message?.content}</div>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="d-flex flex-row messageInput">
                <input type="text" onKeyDown={handleKeyPress} className="form-control border-0 pe-0" value={sendMessageContent} onChange={(e) => setSendMessageContent(e.target.value)} placeholder="Type a message..." id="sendMessage" name="sendMessage" disabled={!sendMessageContent && !roomId} />
                <CustomToolTip id="sendMessageTooltip" title="Send message" placement="top">
                    <button className="btn text-secondary" type="button" onClick={sendMessage} disabled={!sendMessageContent || !roomId}><i className="bi bi-send"></i></button>
                </CustomToolTip>
            </div>
        </>
    );
};

export default MessageList;