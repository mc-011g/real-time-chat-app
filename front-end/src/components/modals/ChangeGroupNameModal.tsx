import { useContext, useEffect, useState } from "react";
import Button from "../Button";
import Input from "../Input";
import Modal from "./Modal";
import type { GroupType, ToastType } from "../../types/types";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { updateGroupNameUtil } from "../../util/updateGroupNameUtil";
import { useSelector } from "react-redux";
import { getGroup, getGroups, groupsState } from "../../redux/selectors";
import { socket } from "../../socket";
import { UserContext } from "../../context/UserContext";

export default function ChangeRoomNameModal({ setToast, setShowModal, setChangeGroupNameModal }:
    {
        setToast: (value: ToastType) => void,
        setChangeGroupNameModal: (value: boolean) => void,
        setShowModal: (value: boolean) => void,
    }) {

    const [name, setName] = useState<string>("");
    const user = useContext(UserContext);
    const dispatch = useAppDispatch();
    const [isSavingGroup, setIsSavingGroup] = useState<boolean>(false);

    const [error, setError] = useState<string>("");

    const groupsStateObject = useSelector(groupsState);
    const selectedGroup = useSelector(groupsStateObject.selectedGroupId ? getGroup(groupsStateObject.selectedGroupId) : () => null);
    const groups: GroupType[] = useSelector(getGroups);

    useEffect(() => {
        if (selectedGroup) {
            setName(selectedGroup.name);
        }
    }, [selectedGroup]);

    const handleSubmit = async () => {
        if (!groups || !selectedGroup || !user) {
            return;
        }
        setIsSavingGroup(true);

        socket.emit('change-group-name', name, selectedGroup._id);

        const result = await dispatch(updateGroupNameUtil(user, name, selectedGroup._id));

        if (result?.success) {
            setToast({ id: 2, success: true, message: "Group name saved." });
            setChangeGroupNameModal(false);
        } else {
            setError(result?.error);
        }
        setIsSavingGroup(false);
    }

    return (
        <Modal title={"Change Group Name"} setShowModal={() => setShowModal(false)}>
            <form className="flex flex-col justify-between h-full gap-4" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>

                <label>
                    <span className="text-gray-600">New Group Name</span>
                    <Input placeholder={"New Group Name"} type={"text"} value={name} onChange={(e) => setName(e.target.value)} required />
                </label>

                <Button variant={"primary-solid"} type="submit"
                    disabled={!name || isSavingGroup}
                >
                    <div className="flex flex-row gap-2 align-middle justify-center place-items-center">
                        {isSavingGroup &&
                            <div className="border-blue-400 border-t-blue-50 w-4 h-4 border-2 rounded-full animate-spin"></div>
                        }
                        <div>Save</div>
                    </div>
                </Button>

                {error &&
                    <div className="text-red-600">{error}</div>
                }
            </form>
        </Modal>
    )
}