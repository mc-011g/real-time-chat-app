import { Toast, ToastContainer } from "react-bootstrap";

const CustomToast = ({ show, message, onClose }) => (

    <ToastContainer className="p-3" position="bottom-end" style={{ zIndex: 1 }}>
        <Toast show={show} onClose={onClose} delay={3000} autohide>
            <Toast.Body>{message}</Toast.Body>
        </Toast>
    </ToastContainer>

);

export default CustomToast;