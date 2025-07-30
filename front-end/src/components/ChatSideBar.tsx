import { useContext, useEffect, useRef, useState } from "react";
import Input from "./Input";
import GroupImageContainer from "./GroupImageContainer";
import UserImageContainer from "./UserImageContainer";
import DropdownContainer from "./dropdown/DropdownContainer";
import { ArrowRightStartOnRectangleIcon, MagnifyingGlassIcon, PlusIcon, UserIcon } from "@heroicons/react/24/solid";
import DropdownList from "./dropdown/DropdownList";
import DropdownItem from "./dropdown/DropdownItem";
import { useNavigate } from "react-router-dom";
import type { GroupType } from "../types/types";
import { getAuth, signOut } from "firebase/auth";
import { useSelector } from "react-redux";
import { getGroup, getGroups, getUser, groupsState, getIsGroupsLoading } from "../redux/selectors";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { fetchUserGroupsThunk } from "../redux/thunks/fetchUserGroupsThunk";
import { setSelectedGroup } from "../redux/slices/groupsSlice";
import { socket } from "../socket";
import { UserContext } from "../context/UserContext";

export default function ChatSideBar({ dropdown, setDropdown, dropDownRef, setShowCreateGroupModal, showSideBarToggle, setShowSideBarToggle }:
    {
        dropdown: string | null, setDropdown: (value: string | null) => void,
        dropDownRef: React.Ref<HTMLDivElement>,
        setShowCreateGroupModal: (value: boolean) => void,
        showSideBarToggle: boolean
        setShowSideBarToggle: (value: boolean) => void,
    }) {

    const user = useContext(UserContext);
    const userData = useSelector(getUser);
    const groupsList: GroupType[] = useSelector(getGroups);
    const joinedGroup = useRef(false);
    const groupsStateObject = useSelector(groupsState);
    const selectedGroup = useSelector(groupsStateObject.selectedGroupId ? getGroup(groupsStateObject.selectedGroupId) : () => null);
    const [searchGroupQuery, setSearchGroupQuery] = useState<string>("");
    const [filteredGroups, setFilteredGroups] = useState<GroupType[] | null>(null);

    const isGroupsLoading = useSelector(getIsGroupsLoading);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (groupsList.length === 0 && user) {
            dispatch(fetchUserGroupsThunk(user));
        }
    }, [dispatch, groupsList.length, user]);

    useEffect(() => {
        if (!selectedGroup && !joinedGroup.current) {
            const groupId = window.localStorage.getItem('selectedGroupId');
            if (groupId) {
                socket.emit('join-group', groupId);
                dispatch(setSelectedGroup(groupId));
                joinedGroup.current = true;
            }
        }
    }, [dispatch, selectedGroup]);

    const handleSelectGroup = (groupId: string) => {
        if (!user) {
            return;
        }

        //Leave previous group if exists
        if (selectedGroup?._id !== groupId) {
            socket.emit('leave-group', selectedGroup?._id);

            if ((selectedGroup && (selectedGroup._id !== groupId)) || !selectedGroup) {
                window.localStorage.setItem('selectedGroupId', groupId);
                dispatch(setSelectedGroup(groupId));
                socket.emit('join-group', groupId);
            }
        }
    }

    useEffect(() => {
        if (searchGroupQuery && groupsList) {
            const filteredList = groupsList.filter(group => group.name.toLowerCase().includes(searchGroupQuery.toLowerCase()));
            setFilteredGroups(filteredList);
        }
    }, [searchGroupQuery, groupsList]);

    return (
        <div className={`${showSideBarToggle ? 'absolute sm:relative' : 'hidden'}  w-[250px] min-w-[250px] bg-white pb-4 sm:flex flex-col text-gray-900 border border-gray-300 z-30 h-screen`}>

            <div className="flex flex-row items-center gap-2 px-4 py-4 border-b border-gray-300" onClick={() =>
                (dropdown !== "profile" ? setDropdown("profile") : setDropdown(null))}>
                <DropdownContainer>
                    <UserImageContainer firstName={userData?.firstName as string} lastName={userData?.lastName as string} bgColor={userData?.bgColor as string} size={"small"} />
                    {dropdown === "profile" &&
                        <DropdownList dropdownSide="right" dropDownRef={dropDownRef}>
                            <DropdownItem onClick={() => navigate("/profile")}>
                                <UserIcon className="size-6 inline-flex" />
                                <span className="col-start-2">Profile</span>
                            </DropdownItem>
                            <DropdownItem onClick={() => signOut(getAuth())}>
                                <ArrowRightStartOnRectangleIcon className="size-6 inline-flex" />
                                <span className="col-start-2">Logout</span>
                            </DropdownItem>
                        </DropdownList>
                    }
                </DropdownContainer>
                {userData &&
                    <>
                        <span>{userData?.firstName + ' ' + userData?.lastName}</span>
                    </>
                }
            </div>

            <div className="px-4 flex-1 pt-4 flex flex-col overflow-y-hidden gap-2">
                <div className="flex flex-row justify-between items-center mb-2">
                    <h1 className="text-2xl">Chats</h1>
                    <PlusIcon className="size-6 hover:cursor-pointer" onClick={() => setShowCreateGroupModal(true)} />
                </div>
                <div className="relative flex justify-end items-center">
                    <Input placeholder={"Search group"} type={"text"} value={searchGroupQuery} onChange={(e) => setSearchGroupQuery(e.target.value)} />
                    <MagnifyingGlassIcon className="w-6 h-6 absolute text-gray-600 mr-2" />
                </div>
                <div className="flex h-full overflow-y-scroll">
                    <div className="flex flex-col flex-1 h-full">
                        {groupsList && !isGroupsLoading ?
                            <>
                                {((filteredGroups && searchGroupQuery.length > 0) ? filteredGroups : groupsList).map(group =>
                                    <div key={group._id} className={`${selectedGroup && selectedGroup._id === group._id && "bg-gray-200 hover:bg-gray-200"} flex flex-row items-center gap-2 hover:bg-gray-100 p-2 rounded-xl hover:cursor-pointer`} onClick={() => { handleSelectGroup(group._id as string); setShowSideBarToggle(false) }}>
                                        <GroupImageContainer />
                                        <span className="truncate max-w-full">{group.name}</span>
                                    </div>
                                )
                                }
                            </>
                            :
                            <div className="flex flex-1 items-center justify-center h-full">
                                <div className="border-blue-400 border-t-blue-50 w-12 h-12 border-2 rounded-full animate-spin"></div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}