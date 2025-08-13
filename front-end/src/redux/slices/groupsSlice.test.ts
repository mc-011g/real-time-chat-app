import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupType, User } from "../../types/types";
import { addGroup, addUserToGroup, clearGroups, deleteGroup, groupsSlice, initializeGroups, initialState, removeUserFromGroup, setGroupLoading, setSelectedGroup, setSelectedGroupParticipants, updateGroupName, updateSelectedGroupParticipant } from "./groupsSlice";

describe("groupsSlice", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("initializes the groups with a list of groups", () => {

        const groups: GroupType[] = [
            {
                _id: "group1",
                name: "Test Group 1",
                owner: "",
                userIds: ["123"]
            },
            {
                _id: "group2",
                name: "Test Group 2",
                owner: "",
                userIds: ["456"]
            },
            {
                _id: "group3",
                name: "Test Group 3",
                owner: "",
                userIds: ["789"]
            },
        ]

        const result = groupsSlice.reducer(initialState, initializeGroups(groups));
        expect(result.value.ids).toEqual(["group1", "group2", "group3"]);

        expect(result.value.byGroupId["group1"].name).toEqual("Test Group 1");
        expect(result.value.byGroupId["group2"].name).toEqual("Test Group 2");
        expect(result.value.byGroupId["group3"].name).toEqual("Test Group 3");

        expect(result.value.byGroupId["group1"].byUserId).toEqual({});
        expect(result.value.byGroupId["group2"].byUserId).toEqual({});
        expect(result.value.byGroupId["group3"].byUserId).toEqual({});
    });
});

it("sets a selected group", () => {
    const groupId = "123";
    const result = groupsSlice.reducer(initialState, setSelectedGroup(groupId));

    expect(result.value.selectedGroupId).toEqual(groupId);
});

it("sets the loading state of a group", () => {
    const isLoading = true;
    const result = groupsSlice.reducer(initialState, setGroupLoading(isLoading));
    expect(result.value.loading).toEqual(isLoading);
});

it("sets the selected group participants", () => {

    const groupParticipants: User[] = [
        {
            _id: "1",
            firstName: "testfirst1",
            lastName: "testlast1",
            bgColor: "orange",
            email: "test1@email.com",
            groupIds: ['1', '2', '3']
        },
        {
            _id: "2",
            firstName: "testfirst3",
            lastName: "testlast2",
            bgColor: "blue",
            email: "test2@email.com",
            groupIds: ['1', '2', '3']
        },
        {
            _id: "3",
            firstName: "testfirst3",
            lastName: "testlast3",
            bgColor: "green",
            email: "test3@email.com",
            groupIds: ['1', '2', '3']
        },
    ]

    const payload = {
        users: groupParticipants,
        groupId: "1",
    };

    const result = groupsSlice.reducer(initialState, setSelectedGroupParticipants(payload));

    groupParticipants.forEach(user => {
        if (result.value.byGroupId["1"]?.byUserId) {
            expect(result.value.byGroupId["1"].byUserId[user._id]).toEqual(user);
        }
    });
});

it("updates selected group participants", () => {

    const group: GroupType = {
        _id: "1",
        name: "Group 1",
        owner: "1",
        userIds: ['1', '2', '3']
    }

    const user: User = {
        _id: "1",
        firstName: "testfirst",
        lastName: "testlast",
        bgColor: "",
        email: "",
        groupIds: ["1", "2", "3"]
    }

    const userPayload = {
        _id: "1",
        firstName: "testfirst",
        lastName: "testlast",
        bgColor: "",
        email: "",
        groupIds: ["1", "2", "3"]
    }

    let initialUserGroupResult = groupsSlice.reducer(initialState, addGroup(group));
    initialUserGroupResult = groupsSlice.reducer(initialUserGroupResult, addUserToGroup({ groupId: group._id, user }));

    const result = groupsSlice.reducer(initialUserGroupResult, updateSelectedGroupParticipant(user));
    expect(result.value.byGroupId[group._id]?.byUserId?.[user._id]).toMatchObject(userPayload);
});

it("adds a group", () => {
    const group: GroupType = {
        _id: "1",
        name: "Group 1",
        owner: "1",
        userIds: ['1', '2', '3']
    }

    const result = groupsSlice.reducer(initialState, addGroup(group));

    expect(result.value.byGroupId['1']).toEqual(group);
    expect(result.value.ids).toContain("1");
    expect(result.value.byGroupId['1'].userIds).toEqual(['1', '2', '3']);
    expect(result.value.byGroupId['1'].byUserId).toEqual({});
});

it("updates a group", () => {

    const payload = { name: "Group B", _id: "1" };

    const group: GroupType = {
        _id: "1",
        name: "Group A",
        owner: "1",
        userIds: ['1', '2', '3']
    }

    const firstResult = groupsSlice.reducer(initialState, addGroup(group));
    const updatedResult = groupsSlice.reducer(firstResult, updateGroupName(payload));
    expect(updatedResult.value.byGroupId['1'].name).toEqual("Group B");
});

it("deletes a group", () => {
    const payload = { _id: "1" };

    const group: GroupType = {
        _id: "1",
        name: "Group A",
        owner: "1",
        userIds: ['1', '2', '3']
    }

    const initialGroupResult = groupsSlice.reducer(initialState, addGroup(group));
    expect(initialGroupResult.value.byGroupId['1']).toEqual(group);

    const deletedGroupResult = groupsSlice.reducer(initialState, deleteGroup(payload));
    expect(deletedGroupResult.value.byGroupId['1']).toBeUndefined();
});

it("adds a user to the group", () => {
    const user: User = {
        _id: "1",
        firstName: "TestFirst",
        lastName: "TestLast"
    }

    const initialGroup: GroupType = {
        _id: "1",
        name: "Group A",
        owner: "1",
        userIds: ['2', '3']
    }

    const initialResult = groupsSlice.reducer(initialState, addGroup(initialGroup));
    const payload = { groupId: '1', user };
    const updatedResult = groupsSlice.reducer(initialResult, addUserToGroup(payload));

    expect(updatedResult.value.byGroupId['1']?.byUserId?.['1']).toEqual(user);
});

it("removes a user from a group", () => {

    const user: User = {
        _id: "1",
        firstName: "testfirst",
        lastName: "testlast",
        groupIds: ["1", "2", "3"]
    }

    const group: GroupType = {
        _id: "1",
        name: "Group A",
        owner: "1",
        userIds: ['2', '3']
    }

    //Add group
    const initialGroupResult = groupsSlice.reducer(initialState, addGroup(group));
    expect(initialGroupResult.value.byGroupId["1"]).toMatchObject(group);

    //Add user to the group
    const addUserPayload = { groupId: "1", user };
    const updatedGroupResult = groupsSlice.reducer(initialGroupResult, addUserToGroup(addUserPayload));

    expect(updatedGroupResult.value.byGroupId["1"]?.byUserId?.["1"]).toMatchObject(user);

    //Verify that the user was removed from the group
    const removeUserPayload = { groupId: '1', userId: '1' };
    const removedUserResult = groupsSlice.reducer(updatedGroupResult, removeUserFromGroup(removeUserPayload));
    expect(removedUserResult.value.byGroupId["1"].byUserId?.["1"]).toBeUndefined();
});

it("clears all groups in the groups state", () => {
    const group1: GroupType = {
        _id: "1",
        name: "Group A",
        owner: "1",
        userIds: ['2', '3']
    }

    const group2: GroupType = {
        _id: "2",
        name: "Group B",
        owner: "2",
        userIds: ['2', '3']
    }

    const group3: GroupType = {
        _id: "3",
        name: "Group C",
        owner: "3",
        userIds: ['2', '3']
    }

    let initialGroupsResult = groupsSlice.reducer(initialState, addGroup(group1));
    initialGroupsResult = groupsSlice.reducer(initialGroupsResult, addGroup(group2));
    initialGroupsResult = groupsSlice.reducer(initialGroupsResult, addGroup(group3));

    expect(initialGroupsResult.value.byGroupId["1"]).toMatchObject(group1);
    expect(initialGroupsResult.value.byGroupId["2"]).toMatchObject(group2);
    expect(initialGroupsResult.value.byGroupId["3"]).toMatchObject(group3);
    expect(initialGroupsResult.value.ids).toEqual(['1', '2', '3']);

    const clearedGroupsResult = groupsSlice.reducer(initialGroupsResult, clearGroups());

    expect(clearedGroupsResult.value.ids).toEqual([]);
    expect(clearedGroupsResult.value.byGroupId["1"]).toBeUndefined();
    expect(clearedGroupsResult.value.byGroupId["2"]).toBeUndefined();
    expect(clearedGroupsResult.value.byGroupId["3"]).toBeUndefined();
});