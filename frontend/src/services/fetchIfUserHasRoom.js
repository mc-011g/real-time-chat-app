import axiosInstance from "./axiosInstance.js";
import logger from "./logger.js";

export const fetchIfUserHasRoom = async (roomId) => {
    try {
        const response = await axiosInstance.get(`/api/users/${roomId}`);      
        return response.data;
    } catch (error) {
        logger.debug('Error fetching autheticated user: ' + error);
        throw error;
    }
}