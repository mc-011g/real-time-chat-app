import { useState } from "react";
import { Modal, Button } from 'react-bootstrap';
import axiosInstance from "../services/axiosInstance";
import logger from "../services/logger.js";

const LeaveRoomModal = ({ leaveRoom, currentRoomId }) => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleLeaveRoom = async () => {
        if (currentRoomId) {
            try {
                await axiosInstance.get(`/api/rooms/${currentRoomId}/leave`);
                leaveRoom(currentRoomId);
            } catch (error) {
                logger.debug(error);
            }
        }
    }

    return (
        <>
            <button className="btn text-danger w-100 dropdown-item" onClick={handleShow}>Leave room</button>

            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Leave Room</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to leave this room?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={() => { handleLeaveRoom(); handleClose() }}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default LeaveRoomModal;