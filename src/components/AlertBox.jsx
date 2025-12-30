import { Alert } from "react-bootstrap";

export default function AlertBox({ show, message, variant, alertKey }) {
    if (!show) {
        return;
    }

    return (
        <Alert key={alertKey} variant={variant}>
            {message}
        </Alert>
    );
}