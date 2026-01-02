import { useContext, useState } from "react";
import Button from "../Button";
import Input from "../Input";
import Modal from "./Modal";
import type { ToastType } from "../../types/types";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { createGroupThunk } from "../../redux/thunks/createGroupThunk";
import { UserContext } from "../../context/UserContext";
import { useSelector } from "react-redux";
import { getUser } from "../../redux/selectors";

export default function CreateGroupModal({ setShowModal, setToast, setShowCreateGroupModal }:
    {
        setShowModal: (value: boolean) => void,
        setToast: (value: ToastType) => void,
        setShowCreateGroupModal: (value: boolean) => void
    }) {

    const userDetails = useSelector(getUser);

    const user = useContext(UserContext);
    const dispatch = useAppDispatch();
    const [name, setName] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);

    const handleCreateNewGroup = async () => {
        setIsCreatingGroup(true);

        if (!user || !userDetails) {
            return;
        }

        dispatch(createGroupThunk(user, name, userDetails)).then((val) => {
            if (val?.error) {
                setError(val.error);
            } else {
                setShowCreateGroupModal(false);
                setToast({ id: 3, success: true, message: "Group created." });
            }
        }).finally(() => {
            setIsCreatingGroup(false);
        });
    }

    return (
        <Modal title={"Create New Group"} setShowModal={() => setShowModal(false)}>
            <form className="flex flex-col justify-between h-full gap-4" onSubmit={e => { e.preventDefault(); handleCreateNewGroup(); }}>
                <label>
                    <span className="text-gray-600">Group Name:</span>
                    <Input extraClasses="mt-1" placeholder={"Group Name"} type={"text"} value={name} onChange={(e) => setName(e.target.value)} required data-cy="createGroupInput" />
                </label>

                <Button variant={"primary-solid"} type="submit"
                    disabled={!name || isCreatingGroup} data-cy="createGroupSubmitButton">
                    <div className="flex flex-row gap-2 align-middle justify-center place-items-center">
                        {isCreatingGroup &&
                            <div className="border-blue-400 border-t-blue-50 w-4 h-4 border-2 rounded-full animate-spin"></div>
                        }
                        <div>Submit</div>
                    </div>
                </Button>

                {error &&
                    <div className="text-red-700">{error}</div>
                }
            </form>
        </Modal>
    )
}