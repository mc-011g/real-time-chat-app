import { ArrowLeftStartOnRectangleIcon, Bars3Icon, EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon, UsersIcon } from "@heroicons/react/24/solid"
import DropdownContainer from "./dropdown/DropdownContainer";
import DropdownList from "./dropdown/DropdownList";
import DropdownItem from "./dropdown/DropdownItem";
import Tooltip from "./Tooltip";
import type { GroupType } from "../types/types";
import { useSelector } from "react-redux";
import { getGroup, getUser, groupsState } from "../redux/selectors";

export default function ChatHeader({ setShowSideBarToggle, showGroupParticipantsModal, showChangeGroupNameModal, showDeleteGroupModal, showLeaveGroupModal, dropdown, setDropdown, dropDownRef }: {
    setShowSideBarToggle: (value: boolean) => void,
    showGroupParticipantsModal: (value: boolean) => void,
    showChangeGroupNameModal: (value: boolean) => void,
    showDeleteGroupModal: (value: boolean) => void,
    showLeaveGroupModal: (value: boolean) => void,
    dropdown: string | null,
    setDropdown: (value: string | null) => void,
    dropDownRef: React.Ref<HTMLDivElement>
}) {

    const user = useSelector(getUser);
    const groups = useSelector(groupsState);
    const selectedGroup = useSelector(groups.selectedGroupId ? getGroup(groups.selectedGroupId) : () => null);

    return (
        <div className="text-gray-950 flex flex-row justify-between gap-4 place-items-center px-4 py-4 relative flex-nowrap">

            <button aria-label="Open side bar button" type="button" className="flex sm:hidden hover:cursor-pointer" onClick={() => setShowSideBarToggle(true)}>
                <Bars3Icon className="size-6" />
            </button>

            <h1 className="text-2xl overflow-hidden max-w-40 sm:max-w-full truncate" data-cy="groupNameHeader">{selectedGroup ? (selectedGroup as GroupType).name : 'No Group'}</h1>

            {selectedGroup &&
                <div className="flex flex-row gap-4 items-center">
                    <DropdownContainer>
                        <Tooltip position="bottom" text="Participants" id="GPB" >
                            <button type="button" aria-label="Show group participants button" className="hover:cursor-pointer" onClick={() => showGroupParticipantsModal(true)} data-cy="groupParticipantsButton">
                                <UsersIcon className="text-gray-600 size-6" />
                            </button>
                        </Tooltip>

                        {dropdown === "group-options" &&
                            <DropdownList dropdownSide={"left"} extraClasses="-left-14" dropDownRef={dropDownRef}>
                                <DropdownItem onClick={() => { showChangeGroupNameModal(true); setDropdown(null); }} data-cy="changeGroupNameOption">
                                    <PencilSquareIcon className="size-6" />
                                    Change group name
                                </DropdownItem>

                                {selectedGroup?.owner === user?._id ?
                                    <DropdownItem onClick={() => { showDeleteGroupModal(true); setDropdown(null); }} data-cy="deleteGroupOption">
                                        <TrashIcon className="size-6" />
                                        Delete group
                                    </DropdownItem>
                                    :
                                    <DropdownItem onClick={() => { showLeaveGroupModal(true); setDropdown(null); }} data-cy="leaveGroupOption">
                                        <ArrowLeftStartOnRectangleIcon className="size-6" />
                                        Leave group
                                    </DropdownItem>
                                }
                            </DropdownList>
                        }
                    </DropdownContainer>

                    <Tooltip extraClasses="right-0.25" position={"bottom"} text={"Options"} id="OPS">
                        <button type="button" aria-label="Options button" className="hover:cursor-pointer" onClick={() => dropdown !== "group-options" ? setDropdown("group-options") : setDropdown(null)} data-cy="groupOptionsDropdown" >
                            <EllipsisHorizontalIcon className="text-gray-600 size-6" />
                        </button>
                    </Tooltip>
                </div>
            }
        </div>
    )
}