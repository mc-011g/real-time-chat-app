import ChatHeader from "../components/ChatHeader";
import ChatSideBar from "../components/ChatSideBar";
import MessageList from "../components/MessageList";
import SendMessageBar from "../components/SendMessageBar";
import { useContext, useEffect, useRef, useState } from "react";
import Toast from "../components/Toast";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import ChangeRoomNameModal from "../components/modals/ChangeGroupNameModal";
import DeleteGroupModal from "../components/modals/DeleteGroupModal";
import { type MessageType, type ToastType, type User } from "../types/types";
import GroupParticipantsModal from "../components/modals/GroupParticipantsModal";
import CreateGroupModal from "../components/modals/CreateGroupModal";
import { socket } from "../socket";
import LeaveGroupModal from "../components/modals/LeaveGroupModal";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { createMessage } from "../redux/slices/messagesSlice";
import { addUserToGroup, deleteGroup, removeUserFromGroup, updateGroupName, updateSelectedGroupParticipant } from "../redux/slices/groupsSlice";
import { useSelector } from "react-redux";
import { getGroup, groupsState } from "../redux/selectors";
import { UserContext } from "../context/UserContext";

export default function ChatPage() {

    const dispatch = useAppDispatch();

    const [toast, setToast] = useState<ToastType | null>(null);
    const [dropdown, setDropdown] = useState<string | null>(null);
    const [showGroupParticipantsModal, setGroupParticipantsModal] = useState<boolean>(false);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState<boolean>();
    const [showDeleteGroupModal, setDeleteGroupModal] = useState<boolean>(false);
    const [showLeaveGroupModal, setLeaveGroupModal] = useState<boolean>(false);
    const [showChangeGroupNameModal, setChangeGroupNameModal] = useState<boolean>(false);
    const [showSideBarToggle, setShowSideBarToggle] = useState<boolean>(false);

    const toastTimer = useRef<number | null>(null);
    const dropDownRef = useRef<HTMLDivElement>(null);
    const user = useContext(UserContext);
    const groupsStateObject = useSelector(groupsState);
    const selectedGroup = useSelector(groupsStateObject.selectedGroupId ? getGroup(groupsStateObject.selectedGroupId) : () => null);
    const selectedGroupRef = useRef(selectedGroup?._id);
    selectedGroupRef.current = selectedGroup?._id;
    const userRef = useRef(user);
    userRef.current = user;

    useEffect(() => {
        const handleClickOutsideDropdown = (e: { target: Node } | MouseEvent) => {
            if (!(dropDownRef.current && dropDownRef.current.contains(e.target as Node))) {
                setDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutsideDropdown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideDropdown);
        }
    }, [dropdown]);

    useEffect(() => {
        if (toast) {
            if (toastTimer.current) {
                clearTimeout(toastTimer.current);
            }
            const startTimer = () => {
                toastTimer.current = setTimeout(() => {
                    setToast(null);
                    toastTimer.current = null;
                }, 5000) as unknown as number;
            }
            startTimer();
        }
    }, [toast]);

    //Socket event handling
    useEffect(() => {
        function onSendMessage(newMessage: MessageType) {
            dispatch(createMessage(newMessage));
        }

        function onChangeGroupName(newName: string, groupId: string) {
            dispatch(updateGroupName({ name: newName, _id: groupId }));
        }

        function onDeleteGroup(groupId: string) {
            dispatch(deleteGroup({ _id: groupId }));

            if (selectedGroupRef.current === groupId) {
                window.localStorage.removeItem('selectedGroupId');
            }
        }

        function onAddUserToGroup(groupId: string, user: User) {
            dispatch(addUserToGroup({ groupId, user }));
        }

        function onRemoveUserFromGroup(groupId: string, userId: string) {
            dispatch(removeUserFromGroup({ groupId, userId }));
        }

        function onUpdateGroupParticipant(user: User) {
            if (!user) {
                return;
            }
            dispatch(updateSelectedGroupParticipant(user));
        }

        socket.on('send-message', onSendMessage);
        socket.on('change-group-name', onChangeGroupName);
        socket.on('delete-group', onDeleteGroup);
        socket.on('add-user-to-group', onAddUserToGroup);
        socket.on('remove-user-from-group', onRemoveUserFromGroup);
        socket.on('update-group-participant', onUpdateGroupParticipant);

        return () => {
            socket.off('send-message', onSendMessage);
            socket.off('change-group-name', onChangeGroupName);
            socket.off('delete-group', onDeleteGroup);
            socket.off('leave-group', onRemoveUserFromGroup);
        }
    }, [dispatch]);

    return (
        <div className="flex h-[100vh]">
            {showGroupParticipantsModal &&
                <GroupParticipantsModal setGroupParticipantsModal={setGroupParticipantsModal} />
            }
            {showChangeGroupNameModal &&
                <ChangeRoomNameModal setShowModal={setChangeGroupNameModal} setToast={setToast} setChangeGroupNameModal={setChangeGroupNameModal} />
            }
            {showDeleteGroupModal &&
                <DeleteGroupModal setToast={setToast} setShowModal={setDeleteGroupModal} setDeleteGroupModal={setDeleteGroupModal} />
            }
            {showCreateGroupModal &&
                <CreateGroupModal setShowModal={setShowCreateGroupModal} setToast={setToast} setShowCreateGroupModal={setShowCreateGroupModal} />
            }
            {showLeaveGroupModal &&
                <LeaveGroupModal setShowModal={setLeaveGroupModal} setToast={setToast} setLeaveGroupModal={setLeaveGroupModal} />
            }


            {toast &&
                <Toast closeToast={() => setToast(null)}>
                    <>
                        {toast.success ?
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            :
                            <XMarkIcon className="size-6 text-red-600" />
                        }
                        <span className="text-gray-900">{toast.message}</span>
                    </>
                </Toast>
            }

            <ChatSideBar setShowSideBarToggle={setShowSideBarToggle} dropdown={dropdown} setDropdown={setDropdown} dropDownRef={dropDownRef} setShowCreateGroupModal={setShowCreateGroupModal} showSideBarToggle={showSideBarToggle} />

            {showSideBarToggle &&
                <div className="sm:hidden h-screen w-screen bg-black absolute z-20 opacity-50" onClick={() => setShowSideBarToggle(false)}></div>
            }

            <div className="flex flex-col grow">
                <ChatHeader
                    setShowSideBarToggle={setShowSideBarToggle}
                    showGroupParticipantsModal={setGroupParticipantsModal}
                    showChangeGroupNameModal={setChangeGroupNameModal}
                    showDeleteGroupModal={setDeleteGroupModal}
                    showLeaveGroupModal={setLeaveGroupModal}
                    dropdown={dropdown}
                    setDropdown={setDropdown}
                    dropDownRef={dropDownRef}
                />
                <div className="flex flex-col h-[100vh] relative">
                    <MessageList setShowCreateGroupModal={setShowCreateGroupModal} />
                    <SendMessageBar />
                </div>
            </div>
        </div>
    )
}