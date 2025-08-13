import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

vi.mock("axios");

import axios from "axios";
import { type User as FirebaseUser } from "firebase/auth";
import type { GroupType } from "../types/types";
import { deleteGroupUtil } from "./deleteGroupUtil";

describe("deleteGroupUtil", () => {
    const mockAxios = axios as Mocked<typeof axios>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deletes a group in the database with a successfull API call", async () => {
        const mockFirebaseUser: Partial<FirebaseUser> = { //creates mock user with only neccessary info thunk needs
            getIdToken: vi.fn().mockResolvedValue("token")
        }

        const group: GroupType = {
            _id: '1',
            name: 'Group A',
            owner: '1',
            userIds: []
        }

        mockAxios.delete.mockResolvedValue({ data: group });

        const utility = deleteGroupUtil(mockFirebaseUser as FirebaseUser, '1');
        const result = await utility();

        expect(mockFirebaseUser.getIdToken).toHaveBeenCalled();

        expect(mockAxios.delete).toHaveBeenCalledWith(
            expect.stringContaining("/api/chat/group/1"),
            { headers: { authtoken: "token" } }
        );
        expect(result).toEqual({ success: true });
    });
});