import { useContext, useEffect, useRef, useState } from "react";
import Input from "./Input";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import type { MessageType } from "../types/types";
import { v4 as uuidv4 } from 'uuid';
import { getGroup, getUser, groupsState } from "../redux/selectors";
import { useSelector } from "react-redux";
import { socket } from "../socket";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { createMessageUtil } from "../util/createMessageUtil";
import { UserContext } from "../context/UserContext";

export default function SendMessageBar() {
  const [message, setMessage] = useState<string>("");
  const user = useContext(UserContext);
  const userData = useSelector(getUser);

  const sentMessage = useRef(false);
  const dispatch = useAppDispatch();

  const groups = useSelector(groupsState);
  const selectedGroup = useSelector(groups.selectedGroupId ? getGroup(groups.selectedGroupId) : () => null);

  const handleSendMessage = async () => {

    if (!user || !selectedGroup || !userData || message.length === 0) {
      return;
    }

    const newMessage: MessageType = {
      _id: uuidv4(),
      content: message,
      dateSent: new Date(),
      userId: user.uid,
      groupId: selectedGroup._id,
      senderFirstName: userData.firstName,
      senderLastName: userData.lastName,
      bgColor: userData.bgColor,
    }
    setMessage("");

    if (!sentMessage.current) {
      socket.emit('send-message', newMessage, selectedGroup._id);

      dispatch(createMessageUtil(user, newMessage)).then(val => {
        if (val?.error) {
          alert(val.error);
        }
      });

      sentMessage.current = true;
    }

    sentMessage.current = false;
  }

  const handleKeyPress = (e: { key: string; }) => {
    if (e.key === 'Enter' && message.length > 0) {
      handleSendMessage();
    }
  }

  const [joinedGroup, setJoinedGroup] = useState<string | null>(null);

  useEffect(() => {
    socket.on('joined-group', setJoinedGroup);

    return () => {
      socket.off('joined-group', setJoinedGroup);
    }
  }, []);

  return (
    <>
      {selectedGroup && (
        <div className="p-4 relative flex flex-row justify-end items-center">

          <label className="sr-only" htmlFor="sendMessageInputBox">Send a message</label>
          <Input
            disabled={joinedGroup !== selectedGroup._id}
            placeholder="Enter a message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            data-cy="sendMessageInput"
            id="sendMessageInputBox"
            aria-label="Enter a message"
          />

          <div className="absolute mr-2 mx-2 items-center flex">
            <button type="button" aria-label="Send message button" className="hover:cursor-pointer" onClick={handleSendMessage} data-cy="sendMessageButton">
              <PaperAirplaneIcon
                className="w-6 h-6 text-gray-600"
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
}