import { useContext, useEffect, useRef, useState } from "react";
import Input from "./Input";
import GroupImageContainer from "./GroupImageContainer";
import UserImageContainer from "./UserImageContainer";
import DropdownContainer from "./dropdown/DropdownContainer";
import { ArrowRightStartOnRectangleIcon, MagnifyingGlassIcon, PlusIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/solid";
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

    const [isMobile, setIsMobile] = useState<boolean>(false);
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth < 640) {
                setIsMobile(true);
            } else {
                setShowSideBarToggle(false);
                setIsMobile(false);
            }
        }
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
        }
    }, [setShowSideBarToggle]);


    const sideBarRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!isMobile) {
            return;
        }

        const sideBarNode = sideBarRef.current;

        if (!sideBarNode) {
            return;
        }

        sideBarNode.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab") {

                const focusableSelectors = 'button, input, [tabindex]:not([tabindex="-1"])';
                const focusableElements = sideBarNode.querySelectorAll<HTMLElement>(focusableSelectors)
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (focusableElements.length === 0) {
                    e.preventDefault();
                    return;
                }
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
            if (e.key === "Escape") {
                setShowSideBarToggle(false);
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, [setShowSideBarToggle, isMobile]);


    return (
        <div ref={showSideBarToggle ? sideBarRef : null} aria-modal={showSideBarToggle} aria-label="Side bar" role={`${showSideBarToggle ? "dialog" : ''}`} className={`${showSideBarToggle ? 'absolute sm:relative' : 'hidden'}  w-[256px] min-w-[256px] bg-gray-50 pb-4 sm:flex flex-col text-gray-950 border border-gray-300 z-30 h-screen`}>

            <div className="flex flex-row items-center gap-2 px-4 py-4 border-b border-gray-300" >

                <DropdownContainer>

                    <button type="button" className="cursor-pointer" aria-label="User profile button" onClick={() => (dropdown !== "profile" ? setDropdown("profile") : setDropdown(null))}>
                        <UserImageContainer
                            firstName={userData?.firstName as string} lastName={userData?.lastName as string}
                            bgColor={userData?.bgColor as string} size={"small"} data-cy="userProfileImage"
                        />
                    </button>

                    {dropdown === "profile" &&
                        <DropdownList dropdownSide="right" dropDownRef={dropDownRef}>
                            <DropdownItem onClick={() => navigate("/profile")} data-cy="userProfileDropdownItem">
                                <UserIcon className="size-6 inline-flex" />
                                <span className="col-start-2">Profile</span>
                            </DropdownItem>
                            <DropdownItem onClick={() => signOut(getAuth())} data-cy="logoutDropdownItem">
                                <ArrowRightStartOnRectangleIcon className="size-6 inline-flex" />
                                <span className="col-start-2">Logout</span>
                            </DropdownItem>
                        </DropdownList>
                    }

                </DropdownContainer>

                {userData &&
                    <>
                        <span data-cy="userName">{userData?.firstName + ' ' + userData?.lastName}</span>
                    </>
                }

                <button type="button" aria-label="Close side bar button" className={`${!showSideBarToggle ? 'hidden' : 'sm:hidden'} cursor-pointer`} onClick={() => setShowSideBarToggle(false)}>
                    <XMarkIcon className="size-10" />
                </button>

            </div>

            <div className="px-4 flex-1 pt-4 flex flex-col overflow-y-hidden gap-4">

                <div className="flex flex-row justify-between items-center">
                    <h1 className="text-2xl">Chats</h1>
                    <button type="button" aria-label="Create new group button" className="hover:cursor-pointer focus:cursor-pointer" onClick={() => setShowCreateGroupModal(true)} data-cy="createGroupButtonSideBar">
                        <PlusIcon className="size-6" />
                    </button>
                </div>

                <div className="relative flex justify-end items-center">
                    <label htmlFor="searchGroupsInputBox" className="sr-only">Search Groups: </label>
                    <Input id="searchGroupsInputBox" placeholder={"Search group"} type={"text"} value={searchGroupQuery} onChange={(e) => setSearchGroupQuery(e.target.value)} data-cy="searchGroupInput" />
                    <MagnifyingGlassIcon className="w-6 h-6 absolute text-gray-600 mr-2" />
                </div>

                <div className="flex h-full overflow-y-scroll">

                    <div className="flex flex-col flex-1 h-full gap-1">
                        {groupsList && !isGroupsLoading ?
                            <>
                                {((filteredGroups && searchGroupQuery.length > 0) ? filteredGroups : groupsList).map(group =>
                                    <button type="button" aria-label={`Open group button for: ${group.name}`} key={group._id} className={`hover:bg-gray-200 focus:bg-gray-200 ${selectedGroup && selectedGroup._id === group._id && "bg-gray-200 hover:bg-gray-200 focus:bg-gray-200"} flex flex-row items-center gap-2 p-2 rounded-lg hover:cursor-pointer`} onClick={() => { handleSelectGroup(group._id as string); setShowSideBarToggle(false) }}
                                        data-cy="group">
                                        <GroupImageContainer />
                                        <span className="truncate max-w-full">{group.name}</span>
                                    </button>
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