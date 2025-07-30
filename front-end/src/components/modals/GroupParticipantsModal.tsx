import axios from "axios";
import { type InvitationType } from "../../types/types";
import Button from "../Button";
import UserImageContainer from "../UserImageContainer";
import Modal from "./Modal";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { groupsState, getGroup, getGroupParticipants } from "../../redux/selectors";
import { setSelectedGroupParticipants } from "../../redux/slices/groupsSlice";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { UserContext } from "../../context/UserContext";

export default function GroupParticipantsModal({ setGroupParticipantsModal }: {
  setGroupParticipantsModal: (value: boolean) => void
},
) {

  const [invitationCreated, setInvitationCreated] = useState<boolean>(false);
  const [invitationLink, setInvitationLink] = useState<InvitationType | null>(null);
  const [isInvitationCreating, setIsInvitationCreating] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const user = useContext(UserContext);

  const [error, setError] = useState<string>("");

  const [isLoadingParticipants, setIsLoadingParticipants] = useState<boolean>(false);

  const groupsStateObject = useSelector(groupsState);
  const selectedGroup = useSelector(groupsStateObject.selectedGroupId ? getGroup(groupsStateObject.selectedGroupId) : () => null);
  const participants = useSelector(groupsStateObject.selectedGroupId ? getGroupParticipants(groupsStateObject.selectedGroupId) : () => null);

  useEffect(() => {
    if (!selectedGroup || !user) {
      return;
    }

    if (!participants || participants.length === 0) {
      const getGroupParticipants = async () => {
        setIsLoadingParticipants(true);

        const token = user && await user.getIdToken();
        const headers = token ? { authtoken: token } : {};

        const response = await axios.get('/api/chat/group/' + selectedGroup?._id + '/participants', { headers });

        dispatch(setSelectedGroupParticipants({ users: response.data, groupId: selectedGroup._id }));
        setIsLoadingParticipants(false);
      }

      getGroupParticipants();
    }
  }, [dispatch, selectedGroup, user]);

  const handleCreateInvitation = async () => {
    setIsInvitationCreating(true);

    const token = user && await user.getIdToken();
    const headers = token ? { authtoken: token } : {};

    if (!user || !selectedGroup) {
      return;
    }

    try {
      const response = await axios.post('/api/chat/group/' + selectedGroup._id + '/create-invitation', {}, { headers });

      setInvitationLink(response.data);
      setInvitationCreated(true);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error?.response?.data.error);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsInvitationCreating(false);
    }
  }

  return (
    <Modal title={"Group Participants"} setShowModal={setGroupParticipantsModal}>

      {!invitationCreated && participants ?
        <>
          <div>
            <span className="font-bold text-gray-900">{participants?.length}</span>
            <span className="text-gray-600 ml-1">{participants && ((participants?.length > 1 || participants.length === 0)) ? 'Participants' : 'Participant'}</span>
          </div>
          <div className="h-full overflow-scroll">
            <div className="flex flex-col">
              {participants && !isLoadingParticipants && participants.map(participant => (
                <div key={participant._id} className="flex flex-row items-center gap-2 hover:bg-gray-100 rounded-xl p-2">
                  <UserImageContainer firstName={participant.lastName} lastName={participant.firstName} bgColor={participant.bgColor as string} size={"small"} />
                  <span className="text-gray-600">{participant.firstName} {participant.lastName}</span>
                </div>
              ))}
              {isLoadingParticipants && (
                <div className="flex flex-1 items-center justify-center py-4">
                  <div className="border-blue-400 border-t-blue-50 w-12 h-12 border-2 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          <Button variant={"primary-solid"} onClick={handleCreateInvitation}
            disabled={isInvitationCreating}>
            <div className="flex flex-row gap-2 align-middle justify-center place-items-center">
              {isInvitationCreating &&
                <div className="border-blue-400 border-t-blue-50 w-4 h-4 border-2 rounded-full animate-spin"></div>
              }
              <div>Create Invitation</div>
            </div>
          </Button>

          {error &&
            <div className="text-red-600 my-2">
              {error}
            </div>
          }
        </>
        :
        <div className="flex flex-col gap-4">
          <h1 className="font-bold">Invitation link created: </h1>
          {invitationLink &&
            <p>{invitationLink.url}</p>
          }
          <Button variant={"primary-solid"} onClick={() => setInvitationCreated(false)}>Go Back</Button>
        </div>
      }
    </Modal>
  )
}