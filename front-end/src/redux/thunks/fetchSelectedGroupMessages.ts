import axios, { AxiosError } from "axios";
import { initializeSelectedGroupMessages, setMessagesLoading } from "../slices/messagesSlice";
import type { MessageType } from "../../types/types";
import type { User } from "firebase/auth";

export const fetchSelectedGroupMessages = (
    user: User,
    groupId: string) => async (
        dispatch: (arg0:
            | { payload: { groupId: string; messages: MessageType[] }; type: `${string}/initializeSelectedGroupMessages` }
            | { payload: boolean; type: `${string}/setMessagesLoading` }
        ) => void
    ) => {
        const token = user && await user.getIdToken();
        const headers = token ? { authtoken: token } : {};

        if (!user) {
            return;
        }

        dispatch(setMessagesLoading(true));

        try {
            const response = await axios.get('/api/chat/group/' + groupId + '/messages', { headers });
            const groupMessages = response.data;

            dispatch(initializeSelectedGroupMessages({ groupId, messages: groupMessages }));

            return { success: true };
        } catch (error) {
            return { success: false, error: (error as AxiosError).message };
        } finally {
            dispatch(setMessagesLoading(false));
        }
    }