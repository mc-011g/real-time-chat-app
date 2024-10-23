import { useState } from "react";
import { Modal, Button } from 'react-bootstrap';
import CreateInvitationModal from "./CreateInvitationModal.js";
import { CustomToolTip } from "./CustomToolTip.js";

const RoomParticipantsModal = ({ room, roomUsers }) => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <CustomToolTip id="roomParticipantsTooltip" title="View room participants" placement="bottom">
                <button className="btn roomParticipantsButton" onClick={handleShow} disabled={!room.id}>
                    <i className="bi bi-people-fill"></i>
                </button>
            </CustomToolTip>

            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{room.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <b>Participants ({roomUsers?.length})</b>
                    <div className="d-flex flex-column">
                        <CreateInvitationModal roomId={room.id} />
                        {roomUsers?.map((user) => (
                            <div key={user.id} className="d-flex flex-row align-items-center gap-2 p-2 roomParticipant">
                                <div className="roomListImage userListImage">
                                    {!user.profilePictureUrl &&
                                        <div>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</div>
                                    }
                                </div>
                                <div>{user.firstName} {user.lastName}</div>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default RoomParticipantsModal;