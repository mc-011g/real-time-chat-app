import { createSlice } from "@reduxjs/toolkit";
import type { GroupsType, GroupType, User } from "../../types/types"

const initialState: { value: GroupsType } = {
    value: {
        byGroupId: {},
        selectedGroupId: null,
        ids: [],
        loading: false
    }
};

export const groupsSliceDef = {
    name: 'groups',
    initialState,
    reducers: {
        initializeGroups: (state: { value: GroupsType }, action: { payload: GroupType[]; }) => {
            action.payload.forEach(group => {
                if (!state.value.ids.includes(group._id)) {
                    state.value.byGroupId[group._id] = group;
                    state.value.byGroupId[group._id].byUserId = {};
                    state.value.ids.push(group._id);
                }
            })
        },
        setSelectedGroup: (state: { value: GroupsType }, action: { payload: string }) => {
            const groupId = action.payload
            state.value.selectedGroupId = groupId;
        },
        setGroupLoading: (state: { value: GroupsType }, action: { payload: boolean }) => {
            state.value.loading = action.payload;
        },
        setSelectedGroupParticipants: (state: { value: GroupsType }, action: { payload: { users: User[], groupId: string } }) => {
            const { users, groupId } = action.payload;

            if (state.value.ids.includes(groupId)) {
                users.forEach(user => {
                    state.value.byGroupId[groupId].byUserId[user._id] = user;
                });
            }
        },
        updateSelectedGroupParticipant: (state: { value: GroupsType }, action: { payload: User }) => {
            const participant = action.payload;
            const { groupIds } = participant;

            if (!groupIds) {
                return;
            }

            groupIds.forEach(groupId => {
                if (state.value.ids.includes(groupId) && state.value.byGroupId[groupId].userIds.includes(participant._id)) {
                    const userState = state.value.byGroupId[groupId].byUserId[participant._id];
                    state.value.byGroupId[groupId].byUserId[participant._id] = { ...userState, ...participant };
                }
            });
        },
        addGroup: (state: { value: GroupsType }, action: { payload: GroupType }) => {
            const group = action.payload;

            if (!state.value.ids.includes(group._id)) {
                state.value.byGroupId[group._id] = group;
                state.value.ids.push(group._id);
                state.value.byGroupId[group._id].byUserId = {};
            }
        },
        updateGroupName: (state: { value: GroupsType }, action: { payload: { name: string, _id: string }; }) => {
            const { _id, name } = action.payload;
            const group = state.value.byGroupId[_id];

            if (group) {
                group.name = name;
            }
        },
        deleteGroup: (state: { value: GroupsType }, action: { payload: { _id: string } }) => {
            const { _id } = action.payload;
            const group = state.value.byGroupId[_id];

            if (group) {
                delete state.value.byGroupId[_id];

                state.value.ids = state.value.ids.filter(existingGroupId => existingGroupId !== _id);

                if (state.value.selectedGroupId === _id) {
                    state.value.selectedGroupId = null;
                }
            }
        },
        addUserToGroup: (state: { value: GroupsType }, action: { payload: { groupId: string, user: User } }) => {
            const { groupId, user } = action.payload;
            const userId = user._id;

            const group = state.value.byGroupId[groupId];

            if (group) {
                if (!group.userIds.includes(userId)) {
                    group.userIds.push(userId);
                    group.byUserId[userId] = user;
                }
            }
        },
        removeUserFromGroup: (state: { value: GroupsType }, action: { payload: { groupId: string, userId: string } }) => {
            const { groupId, userId } = action.payload;
            const group = state.value.byGroupId[groupId];

            if (group) {
                if (group.userIds.includes(userId)) {
                    group.userIds = group.userIds.filter(existingUserId => existingUserId !== userId);

                    if (group.byUserId[userId]) {
                        delete group.byUserId[userId];
                    }
                }
            }
        },
        clearGroups: (state: { value: GroupsType }) => {
            state.value = {
                byGroupId: {},
                selectedGroupId: null,
                ids: [],
                loading: false
            };
        }
    }
}

export const groupsSlice = createSlice(groupsSliceDef);

export const { setGroupLoading, initializeGroups, setSelectedGroupParticipants, clearGroups, setSelectedGroup, addGroup, updateGroupName, deleteGroup, addUserToGroup, removeUserFromGroup, updateSelectedGroupParticipant } = groupsSlice.actions;