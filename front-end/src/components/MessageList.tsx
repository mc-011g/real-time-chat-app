import { useContext, useEffect, useRef } from "react";
import UserImageContainer from "./UserImageContainer";
import { useSelector } from "react-redux";
import { getGroup, getGroupMessages, getIsMessagesLoading, groupsState } from "../redux/selectors";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { fetchSelectedGroupMessages } from "../redux/thunks/fetchSelectedGroupMessages";
import { UserContext } from "../context/UserContext";
import Button from "./Button";
import { PlusIcon } from "@heroicons/react/24/solid";


export default function MessageList({ setShowCreateGroupModal }: {
    setShowCreateGroupModal: (value: boolean) => void,
}) {

    const user = useContext(UserContext);
    const groups = useSelector(groupsState);
    const selectedGroup = useSelector(groups.selectedGroupId ? getGroup(groups.selectedGroupId) : () => null);
    const selectedGroupMessages = useSelector(selectedGroup ? getGroupMessages(selectedGroup._id) : () => null);

    const dispatch = useAppDispatch();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isMessagesLoading = useSelector(getIsMessagesLoading);

    useEffect(() => {
        if (selectedGroup && user) {
            if (!selectedGroupMessages) {
                dispatch(fetchSelectedGroupMessages(user, selectedGroup._id)).finally(() => {
                });
            }
        }
    }, [dispatch, selectedGroup, selectedGroupMessages, user]);

    useEffect(() => {
        if (selectedGroupMessages) {

            //Delay scroll to wait for DOM to update first
            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
                }
            }, 0);
        }
    }, [selectedGroup, selectedGroupMessages]);


    return (
        <div className="flex grow bg-gray-50 p-4 border-y border-gray-300 flex-col gap-4 h-100 overflow-scroll">

            {isMessagesLoading &&
                <div className="flex flex-1 items-center justify-center">
                    <div className="border-blue-400 border-t-blue-50 w-12 h-12 border-2 rounded-full animate-spin"></div>
                </div>
            }

            {!isMessagesLoading && user && selectedGroup && selectedGroupMessages && selectedGroupMessages.ids.map(id => {
                const message = selectedGroupMessages.byMessageId[id];
                return message.userId !== user.uid ? (
                    <div className="self-start w-fit flex flex-row gap-2 m-w-[960px]" key={message._id}>
                        <UserImageContainer firstName={message.senderFirstName as string} lastName={message.senderLastName as string} bgColor={message.bgColor as string} size={"small"} />
                        <div className="p-4 rounded-xl bg-gray-200 text-gray-900 m-w-[960px] flex flex-col">

                            <div className="flex flex-row gap-2 place-items-center">
                                <div className="text-gray-600">{message.senderFirstName} {message.senderLastName}</div>
                                <div className="text-gray-500 text-xs">{new Date(message.dateSent).toLocaleString([], { hour: 'numeric', minute: 'numeric' })}</div>
                            </div>

                            {message.content}
                        </div>
                    </div>
                ) : (
                    <div key={message._id} className="p-4 rounded-xl bg-blue-500  self-end w-fit flex flex-col">
                        <div className="text-blue-400 text-xs">{new Date(message.dateSent).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })}</div>
                        <div className="text-gray-50">{message.content}</div>
                    </div>
                );
            }
            )}

            {selectedGroup &&
                <div ref={messagesEndRef} />
            }

            {!isMessagesLoading && (!groups || groups.ids.length === 0) &&
                <div className="w-full h-full text-black flex justify-center gap-4 flex-col items-center">
                    <div>Create or join a group.</div>
                    <div>
                        <Button variant={"primary-solid"} extraClasses="flex flex-row items-center gap-2" onClick={() => setShowCreateGroupModal(true)}>
                            <PlusIcon className="size-6 inline-flex" />
                            <div>Create a Group</div>
                        </Button>
                    </div>
                </div>
            }
        </div>
    )
}