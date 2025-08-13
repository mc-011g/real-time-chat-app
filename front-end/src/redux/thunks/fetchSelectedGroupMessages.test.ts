import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

vi.mock("axios");

import axios from "axios";
import { type User } from "firebase/auth";
import type { MessageType } from "../../types/types";
import { fetchSelectedGroupMessages } from "./fetchSelectedGroupMessages";
import { initializeSelectedGroupMessages, setMessagesLoading } from "../slices/messagesSlice";

describe("fetchSelectedGroupMessages", () => {
    const mockDispatch = vi.fn();
    const mockAxios = axios as Mocked<typeof axios>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("dispatches initializeSelectedGroupMessages with a successfull API call", async () => {
        const mockFirebaseUser: Partial<User> = { //creates mock user with only neccessary info thunk needs
            getIdToken: vi.fn().mockResolvedValue("token")
        }

        const groupMessages: MessageType[] = [
            {
                _id: "1",
                userId: "1",
                content: "Test 1",
                dateSent: new Date,
                groupId: "1"
            },
            {
                _id: "2",
                userId: "1",
                content: "Test 2",
                dateSent: new Date,
                groupId: "1"
            },
            {
                _id: "3",
                userId: "1",
                content: "Test 3",
                dateSent: new Date,
                groupId: "1"
            },

        ]
        mockAxios.get.mockResolvedValue({ data: groupMessages });

        const thunk = fetchSelectedGroupMessages(mockFirebaseUser as User, "1");
        const result = await thunk(mockDispatch);

        expect(mockFirebaseUser.getIdToken).toHaveBeenCalled();
        expect(mockAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("/api/chat/group/1/messages"),
            { headers: { authtoken: "token" } }
        );
        
        expect(mockDispatch).toHaveBeenCalledWith(setMessagesLoading(true));
        expect(mockDispatch).toHaveBeenCalledWith(initializeSelectedGroupMessages({ groupId: '1', messages: groupMessages }));
        expect(mockDispatch).toHaveBeenCalledWith(setMessagesLoading(false));

        expect(result).toEqual({ success: true });
    });
});