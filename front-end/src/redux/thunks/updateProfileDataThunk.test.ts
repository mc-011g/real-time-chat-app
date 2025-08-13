import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

vi.mock("axios");

import axios from "axios";
import { type User as FirebaseUser } from "firebase/auth";
import { updateUserProfileData } from "../slices/userSlice";
import type { User } from "../../types/types";
import { updateUserProfileDataThunk } from "./updateProfileDataThunk";

describe("updateUserProfileDataThunk", () => {
    const mockDispatch = vi.fn();
    const mockAxios = axios as Mocked<typeof axios>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("dispatches initializeUserData with a successfull API call", async () => {
        const mockFirebaseUser: Partial<FirebaseUser> = { //creates mock user with only neccessary info thunk needs
            getIdToken: vi.fn().mockResolvedValue("token")
        }

        const updatedUserData: User = {
            _id: "1",
            email: 'test@email.com',
            firstName: "FirstName",
            lastName: "LastName",
            bgColor: 'blue',
            groupIds: ['1', '2', '3', '4']
        }

        mockAxios.put.mockResolvedValue({ data: updatedUserData });

        const thunk = updateUserProfileDataThunk(mockFirebaseUser as FirebaseUser, updatedUserData);
        const result = await thunk(mockDispatch);

        expect(mockFirebaseUser.getIdToken).toHaveBeenCalled();

        expect(mockAxios.put).toHaveBeenCalledWith(
            expect.stringContaining("/api/user/profile"),
            { 
                email: updatedUserData.email, 
                firstName: updatedUserData.firstName,
                lastName: updatedUserData.lastName
            },
            { headers: { authtoken: "token" } }
        );
        expect(mockDispatch).toHaveBeenCalledWith(updateUserProfileData(updatedUserData));
        expect(result).toEqual({ success: true, user: updatedUserData });
    });
});