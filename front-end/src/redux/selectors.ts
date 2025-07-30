import { createSelector } from "@reduxjs/toolkit";

import type { GroupsType, MessagesType, User } from "../types/types";

export const groupsState = (state: { groups: { value: GroupsType } }) => state.groups.value;

export const messagesState = (state: { messages: { value: MessagesType } }) => state.messages.value;

export const getUser = (state: { user: { value: User } }) => state.user.value;

export const getGroups = createSelector(groupsState, groupsState => groupsState.ids.map(id => groupsState.byGroupId[id]));

export const getGroup = (groupId: string) => createSelector(groupsState, groups => groups.byGroupId[groupId]);

export const getGroupMessages = (groupId: string) => createSelector(messagesState, messages => messages.byGroupId[groupId]);

export const getGroupParticipants = (groupId: string) => createSelector(groupsState, groups => groups.byGroupId[groupId].userIds.map(userId => groups.byGroupId[groupId].byUserId[userId]).filter(Boolean));

export const getIsGroupsLoading = (state: { groups: { value: GroupsType } }) => state.groups.value.loading;

export const getIsMessagesLoading = (state: { messages: { value: MessagesType } }) => state.messages.value.loading;