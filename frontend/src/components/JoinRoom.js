import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { useContext } from "react";
import { RoomContext } from "../context/RoomContext";

const JoinRoom = () => {
    const navigate = useNavigate();
    const { setCurrentRoom } = useContext(RoomContext);

    const joinRoom = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');
        let room = {};

        try {
            const response = await axiosInstance.get(`/api/rooms/join?token=${token}`);
            room = response.data;
            setCurrentRoom(room);
        } catch (error) {
            let errorMessage = { message: 'Failed to join room' };
            navigate('/', { state: errorMessage });
            return;
        }

        navigate('/', { state: { joinedRoomId: room.id } });
        localStorage.setItem('currentRoomId', room.id);
    }

    return (
        <div className="joinRoomContainer align-content-center">
            <div className="joinRoom bg-light align-items-center">
                <h1 className="pb-3">Join Room</h1>
                <button className="btn btn-primary" onClick={joinRoom}>
                    Accept Invitation
                </button>
            </div>
        </div>
    );
};

export default JoinRoom;