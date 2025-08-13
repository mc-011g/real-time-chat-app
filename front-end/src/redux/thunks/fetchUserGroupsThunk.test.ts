import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

vi.mock("axios");

import axios from "axios";
import { type User } from "firebase/auth";
import { initializeGroups, setGroupLoading } from "../slices/groupsSlice";
import { fetchUserGroupsThunk } from "./fetchUserGroupsThunk";
import type { GroupType } from "../../types/types";

describe("fetchUserGroupsThunk", () => {
    const mockDispatch = vi.fn();
    const mockAxios = axios as Mocked<typeof axios>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("dispatches initializeGroups with a successfull API call", async () => {
        const mockFirebaseUser: Partial<User> = { //creates mock user with only neccessary info thunk needs
            getIdToken: vi.fn().mockResolvedValue("token")
        }

        const userGroups: GroupType[] = [
            {
                _id: "1",
                name: "Group A",
                owner: "1",
                userIds: ['1', '2', '3']
            },
            {
                _id: "2",
                name: "Group B",
                owner: "1",
                userIds: ['1', '2', '3']
            },
            {
                _id: "3",
                name: "Group C",
                owner: "1",
                userIds: ['1', '2', '3']
            },
        ]


        mockAxios.get.mockResolvedValue({ data: userGroups });

        const thunk = fetchUserGroupsThunk(mockFirebaseUser as User);
        const result = await thunk(mockDispatch);

        expect(mockFirebaseUser.getIdToken).toHaveBeenCalled();

        expect(mockDispatch).toHaveBeenCalledWith(setGroupLoading(true));
        expect(mockAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("/api/user/groups"),
            { headers: { authtoken: "token" } }
        );
        expect(mockDispatch).toHaveBeenCalledWith(initializeGroups(userGroups));
        expect(result).toEqual({ success: true });
        expect(mockDispatch).toHaveBeenCalledWith(setGroupLoading(false));
    });
});