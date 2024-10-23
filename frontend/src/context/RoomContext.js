import { createContext, useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { jwtDecode } from "jwt-decode";
import logger from "../services/logger.js";

export const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
    const [currentRoom, setCurrentRoom] = useState({});
    const [newTokenSet, setNewTokenSet] = useState(false); //If there is no token and the user signs in, this allows the current room to be set if there was one already
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (token || newTokenSet) {
            const decodedToken = jwtDecode(token);

            if (Date.now() <= decodedToken.exp * 1000) {
                fetchCurrentRoom(token);
            }
        }
    }, [newTokenSet, token]);

    const getCurrentRoom = (value) => {
        return value === true ? setNewTokenSet(true) : setNewTokenSet(false);
    }

    const fetchCurrentRoom = async (token) => {
        const currentRoomId = localStorage.getItem('currentRoomId');

        if (currentRoomId && token) {
            try {
                const response = await axiosInstance.get(`api/rooms/${currentRoomId}`);
                setCurrentRoom(response.data);
            } catch (error) {
                logger.debug(error);
            }
        }
    }

    return <RoomContext.Provider value={{
        currentRoom, setCurrentRoom, getCurrentRoom
    }}>
        {children}
    </RoomContext.Provider>

}