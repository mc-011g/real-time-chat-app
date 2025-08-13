export interface User {
    _id: string,
    email?: string,
    firstName: string,
    lastName: string,
    bgColor?: string,
    groupIds?: string[]
}

export interface ToastType {
    id: number,
    success: boolean,
    message: string
}

export interface DropdownType {
    id: number,
    success: boolean,
    message: string
}

export interface MessageType {
    _id: string,
    userId: string,
    content: string,
    dateSent: Date,
    senderFirstName?: string,
    senderLastName?: string,
    bgColor?: string
    groupId: string,
}

export interface MessagesType {
    byGroupId: {
        [groupId: string]: {
            ids: string[],
            byMessageId: {
                [messageId: string]: MessageType;
            }
        }
    },
    loading: boolean
}

export interface GroupType {
    _id: string,
    name: string,
    owner: string,
    byUserId?: {
        [userId: string]: User
    },
    userIds: string[],
}

export interface GroupsType {
    byGroupId: {
        [groupId: string]: GroupType
    },
    selectedGroupId: string | null,
    ids: string[],
    loading: boolean,
}

export interface InvitationType {
    _id: string,
    url: string,
    groupId: string,
    valid: boolean
}

export interface Message {
    content: string,
    success: boolean
}