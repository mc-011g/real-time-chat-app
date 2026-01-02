import Button from "../Button";
import Modal from "./Modal";
import type { GroupType, ToastType } from "../../types/types";
import { useSelector } from "react-redux";
import { groupsState, getGroup, getGroups } from "../../redux/selectors";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { deleteGroupUtil } from "../../util/deleteGroupUtil";
import { socket } from "../../socket";
import { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";

export default function DeleteGroupModal({ setShowModal, setDeleteGroupModal, setToast }:
    {
        setShowModal: (value: boolean) => void,
        setDeleteGroupModal: (value: boolean) => void,
        setToast: (value: ToastType) => void;
    }) {

    const user = useContext(UserContext);
    const dispatch = useAppDispatch();
    const [error, setError] = useState<string>();

    const groupsStateObject = useSelector(groupsState);
    const selectedGroup = useSelector(groupsStateObject.selectedGroupId ? getGroup(groupsStateObject.selectedGroupId) : () => null);
    const groups: GroupType[] = useSelector(getGroups);
    const [isDeletingGroup, setIsDeletingGroup] = useState<boolean>(false);

    const handleDeleteGroup = async () => {
        if (!groups || !selectedGroup || !user) {
            return;
        }
        setIsDeletingGroup(true);

        socket.emit('delete-group', selectedGroup._id);

        const result = await dispatch(deleteGroupUtil(user, selectedGroup._id));
        if (result && result.success) {
            setToast({ id: 3, success: true, message: "Group deleted." });
            setDeleteGroupModal(false);
        } else {
            if (result?.error) {
                setError(result?.error);
            }
        }
        setIsDeletingGroup(false);

    }

    return (
        <Modal title={"Delete Group"} setShowModal={() => setShowModal(false)}>
            <form className="flex flex-col justify-between h-full gap-4" onSubmit={e => { e.preventDefault(); handleDeleteGroup(); }} data-cy="deleteGroupForm">
                <p className="text-gray-600">Are you sure you want to delete this group?</p>
                <Button variant={"danger-solid"} type="submit" disabled={isDeletingGroup} data-cy="deleteGroupButton">
                    <div className="flex flex-row gap-2 align-middle justify-center place-items-center">
                        {isDeletingGroup &&
                            <div className="border-red-400 border-t-red-50 w-4 h-4 border-2 rounded-full animate-spin"></div>
                        }
                        <div>Delete</div>
                    </div>
                </Button>

                {error &&
                    <div className="text-red-700">
                        {error}
                    </div>
                }
            </form>
        </Modal>
    )
}