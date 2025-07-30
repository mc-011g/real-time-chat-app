import Button from "../Button";
import Modal from "./Modal";
import type { ToastType } from "../../types/types";
import axios from "axios";
import { socket } from "../../socket";
import { useSelector } from "react-redux";
import { getGroup, groupsState } from "../../redux/selectors";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { deleteGroup } from "../../redux/slices/groupsSlice";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";

export default function LeaveGroupModal({ setShowModal, setToast, setLeaveGroupModal }:
    {
        setShowModal: (value: boolean) => void,
        setToast: (value: ToastType) => void,
        setLeaveGroupModal: (value: boolean) => void
    }) {

    const user = useContext(UserContext);
    const groupsStateObject = useSelector(groupsState);
    const selectedGroup = useSelector(groupsStateObject.selectedGroupId ? getGroup(groupsStateObject.selectedGroupId) : () => null);

    const dispatch = useAppDispatch();

    const handleLeaveGroup = async () => {
        if (!user) {
            return;
        }

        setLeaveGroupModal(false);

        if (!selectedGroup) {
            return;
        }

        const token = user && await user.getIdToken();
        const headers = token ? { authtoken: token } : {};

        const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/chat/group/${selectedGroup._id}/users`, {}, { headers });
        const updatedGroupId = response.data;

        dispatch(deleteGroup({ _id: updatedGroupId }));
        socket.emit('remove-user-from-group', user.uid, updatedGroupId);
        setToast({ id: 4, success: true, message: "Left group." });
        socket.emit('remove-user-from-group', selectedGroup._id);

        window.localStorage.removeItem('selectedGroupId');
    }

    return (
        <Modal title={"Leave Group"} setShowModal={() => setShowModal(false)}>
            <form className="flex flex-col justify-between h-full gap-4" onSubmit={e => { e.preventDefault(); handleLeaveGroup(); }}>
                <p className="text-gray-600">Are you sure you want to leave this group?</p>
                <Button variant={"primary-solid"} type="submit">Leave</Button>
            </form>
        </Modal>
    )
}