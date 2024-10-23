import { useState } from "react";
import { Modal, Button } from 'react-bootstrap';
import axiosInstance from "../services/axiosInstance";
import logger from "../services/logger.js";

const CreateInvitationModal = ({ roomId }) => {
    const [show, setShow] = useState(false);
    const [inviteLink, setInviteLink] = useState();
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const createInvitationLink = async () => {
        if (roomId) {
            try {
                const response = await axiosInstance.post(`/api/rooms/${roomId}/invite`)
                setInviteLink(response.data);
            }
            catch (error) {
                logger.debug(error);
            }
        }
    }

    return (
        <>
            <Button variant="primary" className="my-3" onClick={() => { handleShow(); createInvitationLink() }}>
                Create Invitation
            </Button>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Invitation Link</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex flex-column gap-3 mt-3">
                        {inviteLink}
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

export default CreateInvitationModal;