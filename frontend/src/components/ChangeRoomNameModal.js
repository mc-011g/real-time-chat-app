import { useEffect, useState } from "react";
import { Modal, Button } from 'react-bootstrap';
import axiosInstance from "../services/axiosInstance.js";
import { getUserEmail } from "../services/jwtUtils.js";
import logger from "../services/logger.js";
import { validate } from "../services/inputValidation.js";

const ChangeRoomNameModal = ({ currentRoom }) => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [errors, setErrors] = useState({});
    const [newRoomName, setNewRoomName] = useState('');

    useEffect(() => {
        setNewRoomName(currentRoom.name);
    }, [currentRoom.name]);

    const validateInput = (event) => {
        const validationResult = validate(event);
        setErrors(prevErrors => ({ ...prevErrors, [validationResult.name]: validationResult.errorMessage }));
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && currentRoom.name) {
            handleChangeRoomName();
        }
    };

    const checkRoomNameError = () => (errors.roomName ? true : false);
    const checkIfGroupOwner = () => (getUserEmail() === currentRoom.owner);

    const handleChangeRoomName = async () => {
        if (checkRoomNameError() === true) {
            return;
        };

        if (currentRoom && checkIfGroupOwner()) {
            try {
                await axiosInstance.put(`/api/rooms/${currentRoom.id}?newName=${newRoomName}`);
                handleClose();
            } catch (error) {
                logger.debug('Error changing room name: ', error.response.data);
            }
        }
    };

    return (
        <>
            {checkIfGroupOwner() &&
                <>
                    <button className="btn w-100 dropdown-item" onClick={handleShow}>Change room name</button>
                    <Modal show={show} onHide={handleClose} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Change Room Name</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                <label>
                                    Room name:
                                    <input type="text" className="form-control" name="roomName" id="roomName" onKeyDown={handleKeyPress} value={newRoomName} onChange={(e) => { setNewRoomName(e.target.value); validateInput(e); }} maxLength={64} />
                                </label>
                                {errors.roomName &&
                                    <div className="text-danger">{errors.roomName}</div>
                                }
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={() => { handleChangeRoomName(); }}>
                                Save
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            }
        </>
    );
};

export default ChangeRoomNameModal;