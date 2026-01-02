import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import axios from "axios";
import { socket } from "../socket";
import { addGroup, setSelectedGroup } from "../redux/slices/groupsSlice";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";

export default function JoinGroupPage() {

    const user = useContext(UserContext);
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isJoiningGroup, setIsJoiningGroup] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleJoinGroup = async () => {
        if (!user) {
            return;
        }
        setIsJoiningGroup(true);

        const token = user && await user.getIdToken();
        const headers = token ? { authtoken: token } : {};

        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/groups/invitation/${params.id}`, {}, { headers });
            const { user, group } = response.data;

            socket.emit('join-group', group._id);
            window.localStorage.setItem('selectedGroupId', group._id);
            dispatch(setSelectedGroup(group._id));
            dispatch(addGroup(group))
            socket.emit('add-user-to-group', group._id, user);

            navigate('/');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error?.response?.data.error);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setIsJoiningGroup(false);
        }
    }

    return (
        <main className="w-screen h-screen flex flex-col justify-center items-center sm:bg-gray-50">
            <div className="bg-white py-16 px-4 sm:px-8 flex flex-col gap-4 sm:rounded-lg sm:shadow-xl items-center">
                <h1 className="text-xl sm:text-2xl md:text-3xl text-gray-900" data-cy="joinGroupText">You have been invited to join a group.</h1>
                <Button type="button" variant={"primary-solid"} onClick={handleJoinGroup} disabled={isJoiningGroup} data-cy="joinGroupButton">
                    Join
                </Button>
                {error &&
                    <div className="text-red-700">
                        {error}
                    </div>
                }
            </div>
        </main>
    )
}