import axiosInstance from "./axiosInstance.js";
import logger from "../services/logger.js";

export const fetchProfileInformation = async () => {
    try {
        const response = await axiosInstance.get('/api/users/userProfile');
        return response.data;
    } catch (error) {
        logger.debug('Error fetching profile information: ' + error);
        throw error;
    }
}