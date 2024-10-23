import axiosInstance from "./axiosInstance";
import logger from "../services/logger.js";

export const fetchRoomUsers = async (roomId) => {
    try {
        const response = await axiosInstance.get(`/api/rooms/${roomId}/users`);
        return response.data;
    } catch (error) {
        logger.debug('Error fetching room users', error);
    }
}