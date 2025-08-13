import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

vi.mock("axios");

import axios from "axios";
import { type User as FirebaseUser } from "firebase/auth";
import { initializeUserData } from "../slices/userSlice";
import type { User } from "../../types/types";
import { loginThunk } from "./loginThunk";

describe("loginThunk", () => {
    const mockDispatch = vi.fn();
    const mockAxios = axios as Mocked<typeof axios>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("dispatches initializeUserData with a successfull API call", async () => {
        const mockFirebaseUser: Partial<FirebaseUser> = { //creates mock user with only neccessary info thunk needs
            getIdToken: vi.fn().mockResolvedValue("token")
        }

        const userData: User = {
            _id: "1",
            bgColor: 'blue',
            email: 'test@email.com',
            groupIds: ['1', '2'],
            firstName: "FirstName",
            lastName: "LastName"
        }

        mockAxios.get.mockResolvedValue({ data: userData });
  
        const thunk = loginThunk(mockFirebaseUser as FirebaseUser);
        const result = await thunk(mockDispatch);

        expect(mockFirebaseUser.getIdToken).toHaveBeenCalled();

        expect(mockAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("/api/user/profile"),
            { headers: { authtoken: "token" } }
        );
        expect(mockDispatch).toHaveBeenCalledWith(initializeUserData(userData));
        expect(result).toEqual({ success: true });
    });
});