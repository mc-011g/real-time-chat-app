import axios, { AxiosError } from "axios";
import { initializeGroups, setGroupLoading } from "../slices/groupsSlice";
import type { GroupType } from "../../types/types";
import type { User } from "firebase/auth";

export const fetchUserGroupsThunk = (user: User) => async (
    dispatch: (arg0:
        | { payload: GroupType[]; type: `${string}/initializeGroups`; }
        | { payload: boolean; type: `${string}/setGroupLoading`; }
    ) => void
) => {

    const token = user && await user.getIdToken();
    const headers = token ? { authtoken: token } : {};

    if (!user) {
        return;
    }

    dispatch(setGroupLoading(true));

    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/groups`, { headers });
        const userGroups: GroupType[] = response.data;

        dispatch(initializeGroups(userGroups));

        return { success: true };
    } catch (error) {
        return { success: false, error: (error as AxiosError).message };
    } finally {
        dispatch(setGroupLoading(false));
    }
}