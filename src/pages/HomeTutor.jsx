import { Container, Row, Col, Card, Button, Navbar, Nav, Badge, Image } from 'react-bootstrap';
import { FaBell, FaUserCircle, FaSignOutAlt, FaPen, FaUserGraduate, FaClipboardList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LogoNextCertify from '../img/NextCertify.png';

function HomeTutor() {
    const navigate = useNavigate();

    // carrega o user direto na inicialização pra evitar loop infinito
    const [usuario] = useState(() => {
        const saved = localStorage.getItem("usuarioLogado");
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        // se não tiver user, vai pro login
        if (!usuario) {
            navigate('/');
        }
    }, [usuario, navigate]);

    const handleLogout = () => {
        localStorage.removeItem("usuarioLogado");
        navigate('/');
    };

    // gradiente igual ao do layout
    const gradientStyle = {
        background: 'linear-gradient(90deg, #005bea 0%, #00c6fb 100%)',
        color: 'white'
    };

    // loading simples enquanto valida
    if (!usuario) {
        return <div className="p-5 text-center">Carregando...</div>;
    }

    const primeiroNome = usuario.name ? usuario.name.split(' ')[0] : 'Usuário';

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* --- NAVBAR --- */}
            <Navbar bg="white" expand="lg" className="shadow-sm py-3">
                <Container fluid className="px-5">
                    <Navbar.Brand href="#" className="d-flex align-items-center">
                        <Image
                            src={LogoNextCertify}
                            alt="Logo NextCertify"
                            height="40"
                        />
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="text-center mx-auto fw-medium">
                            <Nav.Link href="/home-tutor" className="mx-2 text-dark">Home</Nav.Link>
                            <Nav.Link href="/alunos-tutor" className="mx-2 text-dark">Alunos</Nav.Link>
                            <Nav.Link href="/forms-tutor" className="mx-2 text-dark">Formulário de Acompanhamento</Nav.Link>
                            <Nav.Link href="/contato" className="mx-2 text-dark">Contato</Nav.Link>
                        </Nav>
                        <div className="d-flex align-items-center gap-3">
                            <FaBell size={20} className="text-primary" style={{ cursor: 'pointer' }} />
                            <div className="d-flex align-items-center gap-2">
                                <FaUserCircle size={32} className="text-primary" />
                                <span className="fw-bold text-dark">{usuario.name}</span>
                            </div>
                            <Button variant="outline-danger" size="sm" className="d-flex align-items-center gap-2" onClick={handleLogout}>
                                <FaSignOutAlt size={16} /> Sair
                            </Button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* --- HERO SECTION --- */}
            <div style={{ ...gradientStyle, padding: '60px 0' }}>
                <Container>
                    <Row className="align-items-center">
                        <Col md={8} className="d-flex align-items-center gap-4">
                            <div className="bg-white rounded-circle d-flex justify-content-center align-items-center text-primary"
                                style={{ width: '100px', height: '100px' }}>
                                <FaUserCircle size={80} />
                            </div>
                            <div>
                                <h2 className="mb-1 fw-bold">{usuario.name}</h2>
                                <div className="d-flex align-items-center gap-2">
                                    <Badge bg="light" text="primary" className="px-3 py-1">Tutor</Badge>
                                </div>
                                <p className="mb-0 text-light mt-1 opacity-75">
                                    Estudante de eventos e networking
                                </p>
                            </div>
                        </Col>
                        <Col md={4} className="text-md-end mt-3 mt-md-0">
                            <Button variant="outline-light" className="px-4 py-2 d-inline-flex align-items-center gap-2" onClick={() => navigate('/editar-perfil')}>
                                Editar Perfil <FaPen size={12} />
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* --- CARDS --- */}
            <Container className="my-5 flex-grow-1">
                <div className="mb-5 text-center text-md-start">
                    <h1 className="text-primary fw-bold">Seja bem-vindo {primeiroNome}</h1>
                    <p className="text-muted fs-5">
                        Aqui você pode visualizar seu registro de alunos, preencher formulários de acompanhamento e visualizar seu registro de formulários concluídos e pendentes.
                    </p>
                </div>

                <Row className="g-4">
                    {/* card alunos */}
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm rounded-4 p-4 text-center text-md-start">
                            <Card.Body>
                                <div className="mb-3">
                                    <FaUserGraduate size={70} color="#4fa3f7" className="mb-3" />
                                </div>
                                <h3 className="text-primary fw-bold mb-3">Registro de alunos</h3>
                                <p className="text-muted mb-4">
                                    Verificar alunos cadastrados na tutoria.
                                </p>
                                <Button
                                    variant="primary"
                                    className="px-4 py-2 w-100"
                                    onClick={() => navigate('/alunos-tutor')}
                                >
                                    Veja mais
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* card forms */}
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm rounded-4 p-4 text-center text-md-start">
                            <Card.Body>
                                <div className="mb-3">
                                    <FaClipboardList size={70} color="#7ccbf5" className="mb-3" />
                                </div>
                                <h3 className="text-primary fw-bold mb-3">Registro de formulários</h3>
                                <p className="text-muted mb-4">
                                    Verificar formulários de acompanhamento concluídos e pendentes do Tutor.
                                </p>
                                <Button
                                    variant="primary"
                                    className="px-4 py-2 w-100"
                                    onClick={() => navigate('/relatorios-tutor')}
                                >
                                    Veja mais
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* --- FOOTER --- */}
            <footer style={{ background: 'linear-gradient(90deg, #005bea 0%, #00c6fb 100%)', padding: '30px 0', textAlign: 'center', color: 'white' }} className="mt-auto">
                <Container>
                    <h5 className="mb-0">© 2025 - NextCertify</h5>
                </Container>
            </footer>

        </div>
    );
}

export default HomeTutor;