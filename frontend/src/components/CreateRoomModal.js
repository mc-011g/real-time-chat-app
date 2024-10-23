import { useState } from "react";
import { Modal, Button } from 'react-bootstrap';
import axiosInstance from "../services/axiosInstance";
import { CustomToolTip } from "./CustomToolTip";
import { validate } from "../services/inputValidation";

const CreateRoomModal = ({ addNewRoom }) => {
    const [show, setShow] = useState(false);
    const [roomName, setRoomName] = useState();
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [errors, setErrors] = useState({});

    const validateInput = (event) => {
        const validationResult = validate(event);
        setErrors(prevErrors => ({ ...prevErrors, [validationResult.name]: validationResult.errorMessage }));
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && roomName) {
            handleCreateRoom();
        }
    };

    const checkRoomNameError = () => {
        if (errors.roomName) {
            handleShow();
            return;
        }
    }

    const handleCreateRoom = async () => {
        checkRoomNameError();

        try {
            const response = await axiosInstance.post('/api/rooms/create', { roomName });
            addNewRoom(response.data);
            setRoomName('');
            handleClose();
        } catch (error) {
            if (error.response.status === 400) {
                setErrors(error.response.data);
                handleShow();
            }
        }
    };

    return (
        <>
            <CustomToolTip id="createRoomTooltip" title="Create a new room" placement="top">
                <button className="btn fs-4 p-0" onClick={handleShow}>
                    <i className="bi bi-plus"></i>
                </button>
            </CustomToolTip>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create Room</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <label>
                            Room name:
                            <input type="text" className="form-control" name="roomName" id="roomName" onKeyDown={handleKeyPress} onChange={(e) => { setRoomName(e.target.value); validateInput(e) }} maxLength={64} />
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
                    <Button variant="primary" onClick={() => { handleCreateRoom(); }}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CreateRoomModal;