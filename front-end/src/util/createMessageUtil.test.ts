import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

vi.mock("axios");

import axios from "axios";
import { type User as FirebaseUser } from "firebase/auth";
import { createMessageUtil } from "./createMessageUtil";
import type { MessageType } from "../types/types";

describe("createMessageUtil", () => {
    const mockAxios = axios as Mocked<typeof axios>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("create a message in the database with a successfull API call", async () => {
        const mockFirebaseUser: Partial<FirebaseUser> = { //creates mock user with only neccessary info thunk needs
            getIdToken: vi.fn().mockResolvedValue("token")
        }

        const message: MessageType = {
            _id: "1",
            userId: "1",
            content: "Test message",
            dateSent: new Date(),
            groupId: "1",
            senderFirstName: "FirstName",
            senderLastName: "LastName",
            bgColor: "Blue"
        }

        mockAxios.post.mockResolvedValue({ data: message });

        const utility = createMessageUtil(mockFirebaseUser as FirebaseUser, message);
        const result = await utility();

        expect(mockFirebaseUser.getIdToken).toHaveBeenCalled();

        expect(mockAxios.post).toHaveBeenCalledWith(
            expect.stringContaining("/api/chat/group/1/send-message"),
            { message },
            { headers: { authtoken: "token" } }
        );
        expect(result).toEqual({ success: true });
    });
});