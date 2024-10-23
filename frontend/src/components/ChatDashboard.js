import { useCallback, useContext, useEffect, useState } from "react";
import { fetchRooms } from "../services/fetchRooms";
import CreateRoomModal from "./CreateRoomModal";
import MessageList from "./MessageList";
import { getUserRole, checkIfTokenExpired, getToken } from "../services/jwtUtils";
import { useLocation, useNavigate } from "react-router-dom"
import RoomParticipantsModal from "./RoomParticipantsModal";
import { fetchProfileInformation } from "../services/fetchProfileInformation";
import { RoomContext } from "../context/RoomContext";
import DeleteRoomModal from "./DeleteRoomModal";
import LeaveRoomModal from "./LeaveRoomModal";
import { CustomToolTip } from "./CustomToolTip";
import CustomToast from "./CustomToast";
import { WebSocketClientContext } from "../context/WebSocketClientContext";
import ChangeRoomNameModal from "./ChangeRoomNameModal";
import logger from "../services/logger.js";

const ChatDashboard = () => {

    const [searchedRooms, setSearchedRooms] = useState([]);
    const { currentRoom, setCurrentRoom } = useContext(RoomContext);
    const [user, setUser] = useState();
    const navigate = useNavigate();
    const [isNavigated, setIsNavigated] = useState(false);
    const location = useLocation();
    const locationState = location.state || {};
    const [searchText, setSearchText] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const token = getToken();

    const { updateRoomParticipants, userRooms, setRooms, updatedRoom, setUpdatedRoom,
        unsubscribeFromRoom, roomUsers, setRoomUsers,
        updatedRoomName, setUpdatedRoomName, updatedRoomId, setUpdatedRoomId, connected,
        loggedBackIn } = useContext(WebSocketClientContext);

    const handleLogout = useCallback(async () => {
        localStorage.removeItem('token');
        navigate('/login');
        window.location.reload(false);
    }, [navigate]);

    useEffect(() => {
        if (location.state?.message) {
            setShowToast(true);
            setToastMessage(location.state.message);

            //Clears toast message from state
            navigate(location.pathname, { state: { ...location.state, message: undefined } });
        }

        const userRole = getUserRole(token);

        if (!token || checkIfTokenExpired() || !userRole) {
            handleLogout();
        }

        setIsNavigated(true);
    }, [handleLogout, location.pathname, location.state, loggedBackIn, navigate, token]);

    const getRooms = useCallback(async () => {
        try {
            const rooms = await fetchRooms();
            setRooms(rooms);
        } catch (error) {
            logger.debug('Error fetching rooms: ', error);
        }
    }, [setRooms]);

    useEffect(() => {
        if (isNavigated && getToken()) {
            const getProfileInformation = async () => {
                try {
                    const profileInformation = await fetchProfileInformation();
                    setUser(profileInformation);
                } catch (error) {
                    logger.debug(error);
                }
            }
            getProfileInformation();
            setIsNavigated(false);
        }
    }, [isNavigated]);

    useEffect(() => {
        if (user) {
            getRooms();
        }
    }, [getRooms, user]);

    const handleShowToast = (message) => {
        setShowToast(true);
        setToastMessage(message);
    }

    const addNewRoom = (newRoom) => {
        setRooms([...userRooms, newRoom]);
        setCurrentRoom(newRoom);
        localStorage.setItem('currentRoomId', newRoom.id)
        handleShowToast('Created room');
    };

    //This is for when a user leaves or deletes a room.
    const removeRoomFromSideBar = (currentRoomId) => {
        setRooms(userRooms.filter(room => room.id !== currentRoomId));
        setCurrentRoom({});
    }

    const leaveRoom = (currentRoomId) => {
        removeRoomFromSideBar(currentRoomId);
        updateRoomParticipants(currentRoomId);
        unsubscribeFromRoom(currentRoomId);
        handleShowToast('Left room');
    }

    const navigateToProfile = (currentRoomId) => {
        unsubscribeFromRoom(currentRoomId);
        navigate('/profile');
    }

    const handleOpenRoom = (room) => {
        setCurrentRoom(room);
        localStorage.setItem('currentRoomId', room.id)
    }

    //Searches rooms by their name
    const handleSearchRooms = (value) => {
        setSearchText(value);
        const matchingRooms = userRooms.filter(room => (room.name).toLowerCase().includes(value.toLowerCase()));

        if (value !== "" && matchingRooms) {
            setSearchedRooms(matchingRooms);
        }
    }

    // Gets either the rooms that match the search query, or all rooms
    const roomsList = () => {
        // Returns rooms that were found matching the search query
        if (searchedRooms.length > 0 && searchText.length > 0) {
            return searchedRooms;
        }
        // Returns no rooms because there was no matching rooms
        if (searchedRooms.length === 0 && searchText.length > 0) {
            return [];
        }
        // Returns all rooms
        else {
            return userRooms;
        }
    }

    const updateRoomUsers = (newRoomUsers) => {
        setRoomUsers(newRoomUsers);
    }

    const deleteRoom = (deletedRoomId) => {
        const updatedRooms = userRooms.filter(room => room.id !== deletedRoomId);
        setRooms(updatedRooms);
        handleShowToast('Room deleted');

        if (deletedRoomId === currentRoom.id) {
            setCurrentRoom({});
        }
    };

    const updateRoomInfo = useCallback(() => {
        const foundUpdatedRoom = userRooms.find(room => room.id === updatedRoomId);

        if (foundUpdatedRoom?.id === currentRoom.id) {
            setCurrentRoom(prevRoom => ({ ...prevRoom, ...foundUpdatedRoom }));
        }

        setUpdatedRoomName(null); //Clear deleted room state after using it   
    }, [currentRoom.id, userRooms, setCurrentRoom, setUpdatedRoomName, updatedRoomId]);

    //Updates room when the room name changes.
    useEffect(() => {
        if ((updatedRoomName && updatedRoomId) && connected === true) {
            updateRoomInfo();
        }
    }, [connected, currentRoom, userRooms, setCurrentRoom, setUpdatedRoomName, updateRoomInfo, updatedRoomId, updatedRoomName]);

    // Updates room last message
    useEffect(() => {
        if (updatedRoom && connected && user) {
            const updateRoom = (updatedRoom) => {

                const updatedRooms = userRooms.map(room =>
                    room.id === updatedRoom.id ? { ...room, ...updatedRoom } : room
                );

                setRooms(updatedRooms);
                setUpdatedRoomName(updatedRoom.name);
                setUpdatedRoomId(updatedRoom.id);
            };

            updateRoom(updatedRoom);
            setUpdatedRoom(null); //Clear updated room state after using it
        }
    }, [connected, updatedRoom, userRooms, setUpdatedRoom, setRooms, setUpdatedRoomName, setUpdatedRoomId, user]);

    return (
        <div className="d-flex chatContainer">
            <div className="p-3 bg-light h-100  d-flex flex-column gap-3 chatSideBar">
                <div className="d-flex flex-column gap-3 h-100">
                    <div className="d-flex flex-row text-center align-items-center">
                        <div>
                            <button className="profilePicture me-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                {!user?.profilePictureURL && user?.firstName.charAt(0) + user?.lastName.charAt(0)}
                            </button>
                            <ul className="dropdown-menu">
                                <li>
                                    <div className="dropdown-item" onClick={() => navigateToProfile(currentRoom.id)}>
                                        Profile
                                    </div>
                                </li>
                                <li>
                                    <div className="dropdown-item w-100" onClick={handleLogout}>
                                        Logout
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="sideBarProfileText">{user?.firstName} {user?.lastName}</div>
                    </div>
                    <div className="d-flex flex-column overflow-hidden justify-content-between h-100">
                        <div>
                            <div className="d-flex flex-row justify-content-between align-items-center">
                                <h4 className="mb-0">Chats</h4>
                                <CreateRoomModal addNewRoom={addNewRoom} handleOpenRoom={handleOpenRoom} />
                            </div>
                            <div className="my-3">
                                <input className="form-control" name="searchRooms" id="searchRooms" placeholder="Search group" onInput={(e) => handleSearchRooms(e.target.value)} maxLength={64} />
                            </div>
                        </div>
                        <div className="overflow-y-scroll h-100">
                            <div className="roomsContainer my-1">
                                {roomsList().length > 0 && roomsList().map(room =>
                                    <div className={`room ${currentRoom.name === room.name && 'roomSelected'}`} key={room.id}
                                        onClick={() => handleOpenRoom(room)}
                                    >
                                        <div className="roomListRoomContainer">
                                            <div className="roomListImage">
                                                <i className="bi bi-people-fill"></i>
                                            </div>

                                            <div className="w-100 overflow-x-hidden">
                                                <div className="roomName">{room.name}</div>
                                                <span className="w-100 roomListLastMessage">
                                                    {(room.lastMessage) &&
                                                        <>
                                                            {room.lastMessageSenderId === user?.id ? 'You: ' : room.lastMessageSenderFirstName + ': '}{room.lastMessage}
                                                        </>
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-3 d-flex w-100 flex-column overflow-hidden">
                <div className="d-flex justify-content-between align-items-center">
                    <h3 className="mb-0 roomName">{currentRoom.name}</h3>
                    <div className="d-flex gap-2">
                        <div className="dropdown">
                            <CustomToolTip title="More" id="moreTooltip" placement="bottom">
                                <button className="btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" disabled={!currentRoom.id}>
                                    <i className="bi bi-three-dots"></i>
                                </button>
                            </CustomToolTip>
                            <ul className="dropdown-menu">
                                <li>
                                    <ChangeRoomNameModal currentRoom={currentRoom} setCurrentRoom={setCurrentRoom} />
                                </li>
                                <li>
                                    <DeleteRoomModal deleteRoom={deleteRoom} currentRoomId={currentRoom.id} roomOwner={currentRoom.owner} />
                                </li>
                                {currentRoom.owner !== user?.email &&
                                    <li>
                                        <LeaveRoomModal leaveRoom={leaveRoom} currentRoomId={currentRoom.id} />
                                    </li>
                                }
                            </ul>
                        </div>
                        <RoomParticipantsModal room={currentRoom} roomUsers={roomUsers} />
                    </div>
                </div>
                <MessageList roomId={currentRoom.id} updateRoomUsers={updateRoomUsers} roomUsers={roomUsers}
                    locationState={locationState} currentUserId={user?.id} currentUserFirstName={user?.firstName}
                    deleteRoom={deleteRoom} user={user} setUser={setUser} updateRoomInfo={updateRoomInfo}
                />
            </div>
            <CustomToast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
        </div >
    );
};

export default ChatDashboard;