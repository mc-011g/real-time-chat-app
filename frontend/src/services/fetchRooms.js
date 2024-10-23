import axiosInstance from "./axiosInstance";
import logger from "../services/logger.js";

export const fetchRooms = async () => {
    try {
        const response = await axiosInstance.get(`/api/users/rooms`);
        return response.data;
    } catch (error) {
        logger.debug('Error fetching rooms: ' + error);
        throw error;
    }
}