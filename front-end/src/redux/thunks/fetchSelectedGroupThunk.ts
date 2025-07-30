import axios, { AxiosError } from "axios";
import { setSelectedGroup } from "../slices/groupsSlice";
import type { User as FirebaseUser } from "firebase/auth";
import type { User } from "../../types/types";

export const fetchSelectedGroupThunk = (user: FirebaseUser, groupId: string) => async (dispatch: (arg0: { payload: string | { users: User[]; groupId: string; }; type: `${string}/setSelectedGroup` | `${string}/setSelectedGroupParticipants`; }) => void) => {

    const token = user && await user.getIdToken();
    const headers = token ? { authtoken: token } : {};

    if (!user) {
        return;
    }

    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/group/'${groupId}`, { headers });
        const selectedGroupId = response.data;
        window.localStorage.setItem('selectedGroupId', groupId);
        dispatch(setSelectedGroup(selectedGroupId));
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as AxiosError).message };
    }

}