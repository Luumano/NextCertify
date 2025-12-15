// O código é para testes de componentes do React, NÃO APAGUE.

import { Button, Form} from "react-bootstrap";
import { useState } from "react";
import useAlert from "../hooks/useAlert";
import AlertBox from "../components/AlertBox";

function Teste() {
    const [email, setEmail] = useState("");
    const { show, message, variant, key, handleAlert } = useAlert();

    const handleSubmit = (e) => {
        e.preventDefault();

        const validEmails = ["icarosaragao2003@gmail.com", "icaro@email.com", "joaosilva@email.com"];

        const validEmail = validEmails.find(mail => mail === email);

        if (!validEmail) {
            handleAlert("E-mail inválido!");
            return;
        }

        alert("Válido!");
    };

    return (
        <>
            <Form onSubmit={handleSubmit} className="p-5">
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label className="text-muted">Email:</Form.Label>
                    <Form.Control
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Digite o e-mail"
                        required
                    />
                </Form.Group>

                <AlertBox
                    show={show}
                    message={message}
                    variant={variant}
                    key={key}
                />

                <Button variant="primary" type="submit">
                    Enviar
                </Button>
            </Form>
        </>
    );
}

export default Teste;