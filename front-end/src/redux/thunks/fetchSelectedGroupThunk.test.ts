(global as unknown as { window: typeof globalThis }).window = global;

import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

vi.mock("axios");

import axios from "axios";
import { type User } from "firebase/auth";
import { setSelectedGroup } from "../slices/groupsSlice";
import { fetchSelectedGroupThunk } from "./fetchSelectedGroupThunk";

describe("fetchSelectedGroupThunk", () => {
    const mockDispatch = vi.fn();
    const mockAxios = axios as Mocked<typeof axios>;

    beforeEach(() => {
        vi.clearAllMocks();

        Object.defineProperty(global, "localStorage", {
            value: {
                getItem: vi.fn(),
                setItem: vi.fn(),
                removeItem: vi.fn(),
                clear: vi.fn(),
            },
            writable: true,
        });
    });

    it("dispatches setSelectedGroup with a successfull API call", async () => {
        const mockFirebaseUser: Partial<User> = { //creates mock user with only neccessary info thunk needs
            getIdToken: vi.fn().mockResolvedValue("token")
        }
        mockAxios.get.mockResolvedValue({ data: '1' });

        const thunk = fetchSelectedGroupThunk(mockFirebaseUser as User, "1");
        const result = await thunk(mockDispatch);

        expect(global.localStorage.setItem).toHaveBeenCalledWith("selectedGroupId", '1');
        expect(mockFirebaseUser.getIdToken).toHaveBeenCalled();
        expect(mockAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("/api/chat/group/1"),
            { headers: { authtoken: "token" } }
        );
        expect(mockDispatch).toHaveBeenCalledWith(setSelectedGroup('1'));
        expect(result).toEqual({ success: true });
    });
});