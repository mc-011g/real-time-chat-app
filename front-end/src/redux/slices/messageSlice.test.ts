import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../socket", () => ({
    __esModule: true,
    socket: { emit: vi.fn() }
}));

import type { GroupType } from "../../types/types";
import { clearMessages, createMessage, initialState, setMessagesLoading } from "./messagesSlice";
import { initializeSelectedGroupMessages, messagesSlice } from "./messagesSlice";
import type { MessageType } from "../../types/types";

describe("messageSlice", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("initializes the selected group's messages", () => {
        const group: GroupType = {
            _id: "1",
            name: "Group A",
            owner: "1",
            userIds: ['1', '2', '3']
        }

        const payload: { groupId: string, messages: MessageType[] } = {
            groupId: "1",
            messages: [
                {
                    _id: "1",
                    userId: "1",
                    content: "Test",
                    dateSent: new Date(),
                    groupId: "1"
                },
                {
                    _id: "2",
                    userId: "1",
                    content: "Test1",
                    dateSent: new Date(),
                    groupId: "1"
                },
                {
                    _id: "3",
                    userId: "1",
                    content: "Test2",
                    dateSent: new Date(),
                    groupId: "1"
                },
            ]
        }

        const result = messagesSlice.reducer(initialState, initializeSelectedGroupMessages(payload));

        payload.messages.forEach(message => {
            expect(result.value.byGroupId[group._id].byMessageId[message._id]).toMatchObject(message);
        });

        expect(result.value.byGroupId[group._id].ids).toEqual(['1', '2', '3']);
    });

    it("sets the loading state for messages", () => {
        let result = messagesSlice.reducer(initialState, setMessagesLoading(true));
        expect(result.value.loading).toBe(true);

        result = messagesSlice.reducer(result, setMessagesLoading(false));
        expect(result.value.loading).toBe(false);
    });

    it("creates a message", () => {
        const payload: MessageType = {
            _id: "1",
            userId: "1",
            content: "Test",
            dateSent: new Date(),
            groupId: "1"
        }

        const result = messagesSlice.reducer(initialState, createMessage(payload))
        expect(result.value.byGroupId['1'].ids).toContain('1');
        expect(result.value.byGroupId['1'].byMessageId['1']).toMatchObject(payload);
    });

    it("clears messages", () => {
        const payload1: MessageType = {
            _id: "1",
            userId: "1",
            content: "Test1",
            dateSent: new Date(),
            groupId: "1"
        }
        const payload2: MessageType = {
            _id: "2",
            userId: "1",
            content: "Test2",
            dateSent: new Date(),
            groupId: "1"
        }
        const payload3: MessageType = {
            _id: "3",
            userId: "1",
            content: "Test3",
            dateSent: new Date(),
            groupId: "1"
        }

        let initialMessagesResult = messagesSlice.reducer(initialState, createMessage(payload1));
        initialMessagesResult = messagesSlice.reducer(initialMessagesResult, createMessage(payload2));
        initialMessagesResult = messagesSlice.reducer(initialMessagesResult, createMessage(payload3));

        expect(initialMessagesResult.value.byGroupId['1'].ids).toEqual(['1', '2', '3']);
        expect(initialMessagesResult.value.byGroupId['1'].byMessageId['1']).toMatchObject(payload1);
        expect(initialMessagesResult.value.byGroupId['1'].byMessageId['2']).toMatchObject(payload2);
        expect(initialMessagesResult.value.byGroupId['1'].byMessageId['3']).toMatchObject(payload3);

        const result = messagesSlice.reducer(initialMessagesResult, clearMessages());

        expect(result.value.byGroupId['1']).toBeUndefined();
    });
})