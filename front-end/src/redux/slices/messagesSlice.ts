import { createSlice } from "@reduxjs/toolkit";
import type { MessagesType, MessageType } from "../../types/types"
import { socket } from "../../socket";

const initialState: { value: MessagesType } = {
    value: {
        byGroupId: {},
        loading: false
    }
};

export const messagesSliceDef = {
    name: 'messages',
    initialState,
    reducers: {
        initializeSelectedGroupMessages: (state: { value: MessagesType }, action: { payload: { groupId: string, messages: MessageType[]; } }) => {
            const { groupId, messages } = action.payload;

            if (!state.value.byGroupId[groupId]) {
                state.value.byGroupId[groupId] = {
                    byMessageId: {},
                    ids: []
                }
            }

            messages.forEach(message => {
                if (!state.value.byGroupId[message.groupId]) {
                    state.value.byGroupId[message.groupId] = {
                        byMessageId: {},
                        ids: []
                    }
                }
                if (!state.value.byGroupId[message.groupId].ids.includes(message._id)) {
                    state.value.byGroupId[message.groupId].ids.push(message._id);
                    state.value.byGroupId[message.groupId].byMessageId[message._id] = message;
                }
            })
        },
        setMessagesLoading: (state: { value: MessagesType }, action: { payload: boolean }) => {
            state.value.loading = action.payload;
        },
        createMessage: (state: { value: MessagesType }, action: { payload: MessageType }) => {
            const message = action.payload;

            if (!state.value.byGroupId[message.groupId]) {
                state.value.byGroupId[message.groupId] = {
                    byMessageId: {},
                    ids: []
                }
            }

            if (!state.value.byGroupId[message.groupId].ids.includes(message._id)) {
                state.value.byGroupId[message.groupId].ids.push(message._id);
                state.value.byGroupId[message.groupId].byMessageId[message._id] = message;
                socket.emit('send-message', message);
            }
        },
        clearMessages: (state: { value: MessagesType }) => {
            state.value = {
                byGroupId: {},
                loading: false
            }
        }
    }
}

export const messagesSlice = createSlice(messagesSliceDef);

export const { setMessagesLoading, initializeSelectedGroupMessages, clearMessages, createMessage } = messagesSlice.actions;