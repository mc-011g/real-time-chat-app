import axiosInstance from "./axiosInstance";
import logger from "../services/logger.js";

export const fetchMessages = async (roomId) => {
    try {
        const response = await axiosInstance.get(`/api/messages/${roomId}/messages`);
        return response.data;
    } catch (error) {
        logger.debug('Error fetching messages: ', error);
        throw error;
    }

};