import axios from "axios";
import type { GroupType, User } from "../../types/types";
import { socket } from "../../socket";
import { addGroup, setSelectedGroup } from "../slices/groupsSlice";
import type { User as FirebaseUser } from "firebase/auth";

export const createGroupThunk = (user: FirebaseUser, name: string, userDetails: User) => async (dispatch: (arg0: { payload: string | GroupType | { users: User[]; groupId: string; }; type: `${string}/addGroup` | `${string}/setSelectedGroup` | `${string}/setSelectedGroupParticipants`; }) => void) => {

    const token = user && await user.getIdToken();
    const headers = token ? { authtoken: token } : {};

    if (!user) {
        return;
    }  

    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/group`, { name }, { headers });
        const newGroup: GroupType = response.data;

        window.localStorage.setItem('selectedGroupId', newGroup._id);
        socket.emit('join-group', newGroup._id);
        socket.emit('add-user-to-group', newGroup._id, userDetails);
        dispatch(addGroup(newGroup));
        dispatch(setSelectedGroup(newGroup._id));    
   
        return { success: true };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return { success: false, error: error?.response?.data.error };
        } else {
            return { success: false, error: "An unexpected error occurred." };
        }
    }
}