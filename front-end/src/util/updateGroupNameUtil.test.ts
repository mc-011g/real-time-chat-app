import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

vi.mock("axios");

import axios from "axios";
import { type User as FirebaseUser } from "firebase/auth";
import type { GroupType } from "../types/types";
import { updateGroupNameUtil } from "./updateGroupNameUtil";

describe("updateGroupNameUtil", () => {
    const mockAxios = axios as Mocked<typeof axios>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("updates a group name in the database with a successfull API call", async () => {
        const mockFirebaseUser: Partial<FirebaseUser> = {
            getIdToken: vi.fn().mockResolvedValue("token")
        }

        const updatedGroup: GroupType = {
           _id: '1',
           name: 'Group B',
           owner: '1',
           userIds: []
        }

        mockAxios.put.mockResolvedValue({ data: updatedGroup });

        const utility = updateGroupNameUtil(mockFirebaseUser as FirebaseUser, 'Group B', '1');  
        const result = await utility();

        expect(mockFirebaseUser.getIdToken).toHaveBeenCalled();

        expect(mockAxios.put).toHaveBeenCalledWith(
            expect.stringContaining("/api/chat/group/1"), 
            { newName: 'Group B'},
            { headers: { authtoken: "token" } }
        );
        expect(result).toEqual({ success: true });
    });
});