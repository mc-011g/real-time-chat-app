import { Tooltip, OverlayTrigger } from "react-bootstrap";

export const CustomToolTip = ({ id, title, placement, children }) => (

    <OverlayTrigger placement={placement} overlay={
        <Tooltip id={id}>{title}</Tooltip>
    }>
        {children}
    </OverlayTrigger>

);