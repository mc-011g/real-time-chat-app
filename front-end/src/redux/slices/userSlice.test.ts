import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../../types/types";
import { initializeUserData, initialState, logoutUser, updateUserProfileData, userSlice } from "./userSlice";

describe("userSlice", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("initializes user data", () => {

        const payload: User = {
            _id: "1",
            email: 'test@email.com',
            firstName: "FirstName",
            lastName: "LastName",
            groupIds: [],
            bgColor: 'blue'
        }

        const result = userSlice.reducer(initialState, initializeUserData(payload));
        expect(result.value?._id).toEqual('1');
        expect(result.value?.firstName).toEqual('FirstName');
        expect(result.value?.lastName).toEqual('LastName');
        expect(result.value?.email).toEqual('test@email.com');
        expect(result.value?.groupIds).toEqual([]);
        expect(result.value?.bgColor).toEqual('blue');
    });

    it("logs out a user", () => {
        const payload: User = {
            _id: "1",
            email: 'test@email.com',
            firstName: "FirstName",
            lastName: "LastName",
            groupIds: [],
            bgColor: 'blue'
        }

        const result = userSlice.reducer(initialState, initializeUserData(payload));
        expect(result.value?._id).toEqual('1');
        expect(result.value?.firstName).toEqual('FirstName');
        expect(result.value?.lastName).toEqual('LastName');
        expect(result.value?.email).toEqual('test@email.com');
        expect(result.value?.groupIds).toEqual([]);
        expect(result.value?.bgColor).toEqual('blue');

        const loggedOutResult = userSlice.reducer(result, logoutUser());
        expect(loggedOutResult.value).toBeNull();
    });

    it("updates a user's profile information", () => {
        const user: User = {
            _id: "1",
            email: 'test@email.com',
            firstName: "FirstName",
            lastName: "LastName",
            groupIds: [],
            bgColor: 'blue'
        }

        const result = userSlice.reducer(initialState, initializeUserData(user));
        expect(result.value).toEqual(user);

        const payload: User = {
            _id: "1",
            email: 'test1@email.com',
            firstName: "FirstName1",
            lastName: "LastName1",
            groupIds: [],
            bgColor: 'green'
        }

        const updatedUserResult = userSlice.reducer(result, updateUserProfileData(payload));
        expect(updatedUserResult.value).toEqual(payload);
    });
});