import { Alert } from "react-bootstrap";

export default function AlertBox({ show, message, variant, key }) {
    if (!show) {
        return;
    }

    return (
        <Alert key={key} variant={variant}>
            {message}
        </Alert>
    );
}