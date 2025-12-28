import { Container, Row, Col, Card, Button, Navbar, Nav, Image } from 'react-bootstrap';
import { FaBell, FaUserCircle, FaSignOutAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LogoNextCertify from '../img/NextCertify.png';

function RelatoriosTutor() {
    const navigate = useNavigate();

    // carrega user sem crashar
    const [usuario] = useState(() => {
        const saved = localStorage.getItem("usuarioLogado");
        return saved ? JSON.parse(saved) : null;
    });

    // controla as abas (tabs)
    const [abaAtiva, setAbaAtiva] = useState('concluidos');

    useEffect(() => {
        if (!usuario) navigate('/');
    }, [usuario, navigate]);

    const handleLogout = () => {
        localStorage.removeItem("usuarioLogado");
        navigate('/');
    };

    // dados fake dos relatorios
    const todosRelatorios = [
        { id: 1, aluno: "João Silva", data: "10/05/25", status: "concluido" },
        { id: 2, aluno: "Maria Oliveira", data: "12/05/25", status: "concluido" },
        { id: 3, aluno: "Pedro Santos", data: "15/05/25", status: "concluido" },
        { id: 4, aluno: "Ana Clara", data: "10/05/25", status: "concluido" },
        { id: 5, aluno: "Lucas Lima", data: "10/06/25", status: "pendente" },
        { id: 6, aluno: "Carla Diaz", data: "11/06/25", status: "pendente" },
        { id: 7, aluno: "Marcos Paulo", data: "12/06/25", status: "pendente" },
        { id: 8, aluno: "Julia Roberts", data: "13/06/25", status: "pendente" },
        { id: 9, aluno: "Roberto Carlos", data: "14/06/25", status: "pendente" },
        { id: 10, aluno: "Fernanda Torres", data: "15/06/25", status: "pendente" },
    ];

    // filtra a lista pela aba selecionada
    const relatoriosFiltrados = todosRelatorios.filter(r => r.status === abaAtiva);

    // contadores pros botões
    const countConcluidos = todosRelatorios.filter(r => r.status === 'concluido').length;
    const countPendentes = todosRelatorios.filter(r => r.status === 'pendente').length;

    if (!usuario) return <div className="p-5 text-center">Carregando...</div>;

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* --- NAVBAR --- */}
            <Navbar bg="white" expand="lg" className="shadow-sm py-3">
                <Container fluid className="px-5">
                    <Navbar.Brand href="#" className="d-flex align-items-center">
                        <Image src={LogoNextCertify} alt="Logo" height="40" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="text-center mx-auto fw-medium">
                            <Nav.Link href="/home-tutor" className="mx-2 text-dark">Home</Nav.Link>
                            <Nav.Link href="/alunos-tutor" className="mx-2 text-dark">Alunos</Nav.Link>
                            <Nav.Link href="/forms-tutor" className="mx-2 text-dark fw-bold">Formulário de Acompanhamento</Nav.Link>
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

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <Container className="my-5 flex-grow-1">

                <h2 className="fw-bold mb-4" style={{ color: '#0f52ba' }}>Relatórios do Tutor</h2>

                {/* --- BOTÕES DE ABAS --- */}
                <div className="d-flex gap-3 mb-5">
                    <Button
                        className="px-5 py-2 fw-bold"
                        style={{
                            backgroundColor: abaAtiva === 'concluidos' ? '#1565c0' : '#888',
                            borderColor: abaAtiva === 'concluidos' ? '#1565c0' : '#888',
                            flex: 1,
                            maxWidth: '300px'
                        }}
                        onClick={() => setAbaAtiva('concluidos')}
                    >
                        Concluídos ({countConcluidos})
                    </Button>

                    <Button
                        className="px-5 py-2 fw-bold"
                        style={{
                            backgroundColor: abaAtiva === 'pendentes' ? '#1565c0' : '#888',
                            borderColor: abaAtiva === 'pendentes' ? '#1565c0' : '#888',
                            flex: 1,
                            maxWidth: '300px'
                        }}
                        onClick={() => setAbaAtiva('pendentes')}
                    >
                        Pendentes ({countPendentes})
                    </Button>
                </div>

                <h4 className="fw-bold mb-4" style={{ color: '#1565c0' }}>Relatórios</h4>

                {/* --- GRID DE CARDS --- */}
                <Row className="g-4">
                    {relatoriosFiltrados.map((item) => (
                        <Col md={6} key={item.id}>
                            <Card className="border-0 shadow-sm rounded-3 p-2">
                                <Card.Body className="d-flex align-items-center justify-content-between">

                                    <div className="d-flex align-items-center gap-3">
                                        {/* muda ícone conforme status */}
                                        {item.status === 'concluido' ? (
                                            <FaCheckCircle size={40} className="text-success" />
                                        ) : (
                                            <FaClock size={40} className="text-warning" />
                                        )}

                                        <div className="d-flex flex-column">
                                            <span className="fw-bold fs-5 text-dark">{item.aluno}</span>
                                            <span className="text-muted small">Data: {item.data}</span>
                                        </div>
                                    </div>

                                    {/* botão muda a ação dependendo do status */}
                                    <Button
                                        variant="primary"
                                        style={{ backgroundColor: '#1565c0', borderColor: '#1565c0' }}
                                        className="fw-bold px-3"
                                        onClick={() => {
                                            if (item.status === 'pendente') {
                                                navigate('/forms-tutor');
                                            } else {
                                                alert("Detalhes do relatório concluído...");
                                            }
                                        }}
                                    >
                                        {item.status === 'concluido' ? 'Ver Detalhes' : 'Preencher Forms'}
                                    </Button>

                                </Card.Body>
                            </Card>
                        </Col>
                    ))}

                    {relatoriosFiltrados.length === 0 && (
                        <p className="text-muted text-center mt-5">Nenhum relatório encontrado nesta categoria.</p>
                    )}
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

export default RelatoriosTutor;