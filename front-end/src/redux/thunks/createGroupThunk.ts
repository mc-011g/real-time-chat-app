import axios from "axios";
import type { GroupType } from "../../types/types";
import { socket } from "../../socket";
import { addGroup } from "../slices/groupsSlice";
import type { User } from "firebase/auth";

export const createGroupThunk = (user: User, name: string) => async (dispatch: (arg0: { payload: GroupType; type: `${string}/addGroup`; }) => void) => {

    const token = user && await user.getIdToken();
    const headers = token ? { authtoken: token } : {};

    if (!user) {
        return;
    }

    try {
        const response = await axios.post('/api/chat/group', { name }, { headers });
        const newGroup: GroupType = response.data;

        window.localStorage.setItem('selectedGroupId', newGroup._id);
        dispatch(addGroup(newGroup));
        socket.emit('join-group', newGroup._id);

        return { success: true };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return { success: false, error: error?.response?.data.error };
        } else {
            return { success: false, error: "An unexpected error occurred." };
        }
    }
}