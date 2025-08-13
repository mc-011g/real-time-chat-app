(global as unknown as { window: typeof globalThis }).window = global;

import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

vi.mock("../../socket", () => ({
    __esModule: true,
    socket: { emit: vi.fn() }
}));

vi.mock("axios");

import axios from "axios";
import { type User } from "firebase/auth";
import type { GroupType } from "../../types/types";
import { createGroupThunk } from "./createGroupThunk";
import { addGroup } from "../slices/groupsSlice";

describe("createGroupThunk", () => {
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

    it("dispatches addGroup with a successfull API call", async () => {
        const mockFirebaseUser: Partial<User> = { //creates mock user with only neccessary info thunk needs
            getIdToken: vi.fn().mockResolvedValue("token")
        }

        const group: GroupType = {
            _id: "1",
            name: "Group A",
            owner: "1",
            userIds: ['1', '2', '3']
        }
        mockAxios.post.mockResolvedValue({ data: group });

        const { socket } = await import("../../socket");

        const thunk = createGroupThunk(mockFirebaseUser as User, "Group A");
        const result = await thunk(mockDispatch);

        expect(mockFirebaseUser.getIdToken).toHaveBeenCalled();
        expect(mockAxios.post).toHaveBeenCalledWith(
            expect.stringContaining("/api/chat/group"),
            { name: group.name },
            { headers: { authtoken: "token" } }
        );
        expect(global.localStorage.setItem).toHaveBeenCalledWith("selectedGroupId", group._id);
        expect(mockDispatch).toHaveBeenCalledWith(addGroup(group));
        expect(socket.emit).toHaveBeenCalledWith("join-group", group._id);
        expect(result).toEqual({ success: true });
    });
});