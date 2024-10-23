import axiosInstance from "./axiosInstance.js";
import logger from "../services/logger.js";

export const fetchAllRoomUsers = async (roomId) => {
    try {
        const response = await axiosInstance.get(`/api/rooms/${roomId}/users/all`);
        return response.data;
    } catch (error) {
        logger.debug('Error fetching room users', error);
    }
}