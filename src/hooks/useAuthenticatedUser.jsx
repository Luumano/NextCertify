import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function useAuthenticatedUser() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        //Não apagar por enquanto para realizar os testes
        // Pegar os dados salvos no LocalStorage
        const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

        if (usuarioLogado) {
            setUsuario(usuarioLogado);
        } else {
            // Vai retornar para login caso não tenha usuário logado
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("usuarioLogado");
        navigate('/');
    };

    const userAuthenticatedProps = {
        usuario,
        handleLogout
    };

    return userAuthenticatedProps;
}

export default useAuthenticatedUser;
