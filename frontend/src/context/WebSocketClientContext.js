import { Client } from "@stomp/stompjs";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { getToken } from "../services/jwtUtils";
import logger from "../services/logger.js";
import { fetchIfUserHasRoom } from "../services/fetchIfUserHasRoom.js";

export const WebSocketClientContext = createContext();

export const WebSocketClientProvider = ({ children }) => {
    const clientRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [userRooms, setRooms] = useState([]);
    const [roomUsers, setRoomUsers] = useState([]);
    const [allRoomUsers, setAllRoomUsers] = useState([]);
    const [deletedRoom, setDeletedRoom] = useState(null);
    const [updatedRoomName, setUpdatedRoomName] = useState(null);
    const [updatedRoomId, setUpdatedRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [updatedRoom, setUpdatedRoom] = useState(null);
    const [updatedUserProfile, setUpdatedUserProfile] = useState(null);
    const subscriptions = useRef([]);
    const token = getToken();
    const [subscribeWithRoomId, setSubscribeWithRoomId] = useState(null);

    useEffect(() => {
        if (getToken()) {
            const client = new Client({
                Authorization: `Bearer ${token}`,
                brokerURL: `ws://${process.env.REACT_APP_API_BASE_URL}/ws`,
                connectHeaders: {
                    Authorization: `Bearer ${token}`
                },

                webSocketFactory: () => new SockJS(`${process.env.REACT_APP_API_BASE_URL}/ws?token=` + token),
                onConnect: (frame) => {
                    subscribeToRoomListChanges();
                    subscribeToRoomDeletion(client);
                    subscribeToUserProfileUpdate();
                    subscribeToErrorQueue(client);
                    setConnected(true);
                },
                onDisconnect: () => {
                    logger.debug('Disconnected from WebSocket server');
                },
                onStompError: (frame) => {
                    logger.debug('Broker reported error: ' + frame.headers['message']);
                    logger.debug('Additional details: ' + frame.body);
                },
                onWebSocketClose: () => {
                    logger.debug('WebSocket connection closed');
                }
            });
            client.activate();
            clientRef.current = client;

            return () => {
                if (client) {
                    client.deactivate();
                }
            };
        }
    }, [token]);

    //For updating room last message sent and room name change
    const subscribeToRoomListChanges = () => {
        try {
            const subscription = clientRef.current.subscribe(`/topic/rooms`, (message) => {

                const response = JSON.parse(message.body);
                if (response) {
                    if (response.type === 'userRoom') {
                        setUpdatedRoom(response);
                    }
                }
            });
            subscriptions.current.push({ type: 'roomListChanges', subscription: subscription });

        } catch (error) {
            logger.debug(error);
        }
    };

    const subscribeToRoomDeletion = () => {
        try {
            const subscription = clientRef.current.subscribe(`/topic/room/delete`, (message) => {
                const response = JSON.parse(message.body);

                if (response.type === 'userRoomDelete') {
                    setDeletedRoom(response);
                }
            });
            subscriptions.current.push({ type: 'roomDeletion', subscription: subscription });
        } catch (error) {
            logger.debug(error);
        }
    };

    const subscribeToUserProfileUpdate = () => {
        try {
            const subscription = clientRef.current.subscribe(`/topic/user/update`, (message) => {
                const response = JSON.parse(message.body);
                setUpdatedUserProfile(response);
            });
            subscriptions.current.push({ type: 'userProfileUpdate', subscription: subscription });
        } catch (error) {
            logger.debug(error);
        }
    };

    const subscribeToRoom = useCallback((roomId) => {
        const subscription = clientRef.current.subscribe(`/topic/room/${roomId}`, (message) => {
            const response = JSON.parse(message.body);

            if (response.type === 'message') {
                setMessages(prevMessages => [...prevMessages, response]);
            }
        });

        subscriptions.current.push({ type: 'room', roomId: roomId, subscription: subscription });
    }, []);

    const subscribeToRoomParticipants = useCallback((roomId) => {
        const subscription = clientRef.current.subscribe(`/topic/room/${roomId}/users`, (message) => {
            setRoomUsers(JSON.parse(message.body));
        });
        subscriptions.current.push({ type: 'roomParticipants', roomId: roomId, subscription: subscription });
    }, []);

    const subscribeToAllRoomParticipants = useCallback((roomId) => {
        const subscription = clientRef.current.subscribe(`/topic/room/${roomId}/users/all`, (message) => {
            setAllRoomUsers(JSON.parse(message.body));
        });
        subscriptions.current.push({ type: 'allRoomPartcipants', subscription: subscription });
    }, []);

    const subscribeToErrorQueue = () => {
        const subscription = clientRef.current.subscribe('/queue/errors', (message) => {
            logger.debug('Message validation error: ', message.body);
        });
        subscriptions.current.push({ type: 'errorQueue', subscription: subscription });
    };

    const unsubscribeFromRoom = useCallback((roomId) => {
        const foundSubscriptions = subscriptions.current.filter(sub =>
            sub.roomId === roomId && sub.type === 'room'
        );

        if (foundSubscriptions) {
            foundSubscriptions.forEach(sub => {
                if (sub.type === 'room') {
                    sub.subscription.unsubscribe();
                }
            }
            );

            subscriptions.current = subscriptions.current.filter(sub => ((sub.type === 'room') && (sub.roomId !== roomId)));
        }
    }, []);

    const disconnectClient = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            logger.debug('Disconnected the client.')
        }
    }, []);

    const publishMessage = (roomId, sendMessageContent, currentUserId,
        currentUserFirstName, currentUserLastName, currentUserEmail) => {
        try {
            if (connected) {
                //Send a message
                try {
                    clientRef.current.publish({
                        destination: `/app/chat.sendMessage/${roomId}`,
                        body: JSON.stringify({
                            content: sendMessageContent, roomId: roomId,
                            senderFirstName: currentUserFirstName,
                            senderLastName: currentUserLastName,
                            senderEmail: currentUserEmail,
                            senderId: currentUserId
                        })
                    });
                } catch (error) {
                    logger.debug('Publishing message, Send message error! ', error);
                }

                //Update room last message with new message
                try {
                    clientRef.current.publish({
                        destination: `/app/updateRoomLastMessage/${roomId}`,
                        body: JSON.stringify({ content: sendMessageContent, senderId: currentUserId, senderFirstName: currentUserFirstName })
                    });
                } catch (error) {
                    logger.debug('Update room error! ', error);
                }
            } else {
                logger.debug('Stomp client is not initialized.');
            }
        } catch (error) {
            logger.debug('Error stringifying message: ', error);
        }
    };

    //Used with leaving, joining, or deleting a group
    const updateRoomParticipants = (currentRoomId) => {
        if (connected) {
            //For current room participants
            try {
                clientRef.current.publish({
                    destination: `/app/updateUsers/${currentRoomId}`
                });
            } catch (error) {
                logger.debug('Update room participants error! ', error);
            }

            //For all users who ever joined the room
            try {
                clientRef.current.publish({
                    destination: `/app/updateAllUsers/${currentRoomId}`
                });
            } catch (error) {
                logger.debug('Update room participants error! ', error);
            }
        } else {
            logger.debug('Stomp client is not initialized.');
        }
    }

    //Makes the room specific subscriptions
    useEffect(() => {
        if (subscribeWithRoomId) {
            const getUserHasRoom = async (roomId) => {
                try {
                    const hasRoom = await fetchIfUserHasRoom(roomId);
                    if (hasRoom === true) {
                        subscribeToRoom(subscribeWithRoomId);
                        subscribeToRoomParticipants(subscribeWithRoomId);
                        subscribeToAllRoomParticipants(subscribeWithRoomId);
                        setSubscribeWithRoomId(null);
                    }
                } catch (error) {
                    logger.debug('Error fetching rooms: ', error);
                }
            };
            getUserHasRoom(subscribeWithRoomId);
        }
    }, [subscribeToAllRoomParticipants, subscribeToRoom, subscribeWithRoomId, subscribeToRoomParticipants]);


    return (
        <WebSocketClientContext.Provider value={{
            subscribeToRoom, subscribeToRoomParticipants, subscribeToAllRoomParticipants,
            deletedRoom, setDeletedRoom, messages, setMessages, updatedRoom, publishMessage,
            updateRoomParticipants, unsubscribeFromRoom, setSubscribeWithRoomId,
            setUpdatedRoom, disconnectClient, setConnected, connected,
            userRooms, setRooms, updatedRoomName, setUpdatedRoomName, updatedRoomId, setUpdatedRoomId,
            setUpdatedUserProfile, updatedUserProfile, roomUsers, setRoomUsers, allRoomUsers, setAllRoomUsers
        }}>
            {children}
        </WebSocketClientContext.Provider>
    )

}

