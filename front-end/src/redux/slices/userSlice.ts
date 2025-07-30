import { createSlice } from "@reduxjs/toolkit";
import type { User } from "../../types/types"

const initialState: { value: User | null } = {
    value: null
};

export const userSliceDef = {
    name: 'user',
    initialState,
    reducers: {
        initializeUserData: (state: { value: User | null }, action: { payload: User; }) => {
            state.value = action.payload;
        },
        logoutUser: (state: { value: User | null }) => {
            state.value = null;
        },
        updateUserProfileData: (state: { value: User | null }, action: { payload: User; }) => {
            if (state.value) {
                state.value = { ...state.value, ...action.payload };
            }
        },
    }
}

export const userSlice = createSlice(userSliceDef);

export const { initializeUserData, logoutUser, updateUserProfileData } = userSlice.actions;