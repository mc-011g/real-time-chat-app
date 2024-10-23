import { useState } from "react";
import { Modal, Button } from 'react-bootstrap';
import axiosInstance from "../services/axiosInstance";
import { getUserEmail } from "../services/jwtUtils";
import logger from "../services/logger.js";

const DeleteRoomModal = ({ deleteRoom, currentRoomId, roomOwner }) => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const checkIfGroupOwner = () => {
        return (getUserEmail() === roomOwner);
    };

    const handleDeleteRoom = async () => {
        if (currentRoomId && checkIfGroupOwner()) {
            try {
                await axiosInstance.delete(`/api/rooms/${currentRoomId}`);
                deleteRoom(currentRoomId);
            } catch (error) {
                logger.debug('Error deleting room: ', error.response.data);
            }
        }
    };

    return (
        <>
            {checkIfGroupOwner() &&
                <>
                    <button className="btn text-danger w-100 dropdown-item" onClick={handleShow}>Delete room</button>

                    <Modal show={show} onHide={handleClose} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Delete Room</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Are you sure you want to delete this room?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="danger" onClick={() => { handleDeleteRoom(); handleClose() }}>
                                Yes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            }
        </>
    );
};

export default DeleteRoomModal;