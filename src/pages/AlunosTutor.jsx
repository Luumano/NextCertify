import { Container, Row, Col, Button, Navbar, Nav, Badge, Image, Table } from 'react-bootstrap';
import { FaBell, FaUserCircle, FaSignOutAlt, FaPen, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LogoNextCertify from '../img/NextCertify.png';

function AlunosTutor() {
    const navigate = useNavigate();

    // carrega user do storage
    const [usuario] = useState(() => {
        const saved = localStorage.getItem("usuarioLogado");
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (!usuario) {
            navigate('/');
        }
    }, [usuario, navigate]);

    const handleLogout = () => {
        localStorage.removeItem("usuarioLogado");
        navigate('/');
    };

    // dados fictícios pra preencher a tabela
    const listaAlunos = [
        { id: 1, nome: "João Silva", email: "joao@teste.email.com", matricula: "123456", forms: 2 },
        { id: 2, nome: "Maria Souza", email: "maria@teste.email.com", matricula: "654321", forms: 0 },
        { id: 3, nome: "Pedro Santos", email: "pedro@teste.email.com", matricula: "123789", forms: 5 },
        { id: 4, nome: "Ana Clara", email: "ana@teste.email.com", matricula: "987654", forms: 2 },
    ];

    const gradientStyle = {
        background: 'linear-gradient(90deg, #005bea 0%, #00c6fb 100%)',
        color: 'white'
    };

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
                            <Nav.Link href="/alunos-tutor" className="mx-2 text-dark fw-bold">Alunos</Nav.Link>
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
            <div style={{ ...gradientStyle, padding: '40px 0' }}>
                <Container>
                    <Row className="align-items-center">
                        <Col md={8} className="d-flex align-items-center gap-4">
                            <div className="bg-white rounded-circle d-flex justify-content-center align-items-center text-primary"
                                style={{ width: '80px', height: '80px' }}>
                                <FaUserCircle size={60} />
                            </div>
                            <div>
                                <h2 className="mb-1 fw-bold fs-3">{usuario.name}</h2>
                                <Badge bg="light" text="primary" className="px-3 py-1">Tutor</Badge>
                                <p className="mb-0 text-light mt-1 opacity-75 small">
                                    Estudante de eventos e networking
                                </p>
                            </div>
                        </Col>
                        <Col md={4} className="text-md-end mt-3 mt-md-0">
                            <Button variant="primary" style={{ backgroundColor: '#004aad', borderColor: '#004aad' }} className="px-4 py-2" onClick={() => navigate('/editar-perfil')}>
                                Editar Perfil
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* --- TABELA --- */}
            <Container className="my-5 flex-grow-1">
                <h2 className="text-primary fw-bold mb-4">Registro de Alunos</h2>

                <div className="bg-white p-4 rounded-4 shadow-sm">
                    <Table responsive hover className="align-middle mb-0">
                        <thead style={{ backgroundColor: '#0f52ba', color: 'white' }}>
                            <tr>
                                <th className="py-3 ps-3" style={{ backgroundColor: '#1565c0', color: 'white', borderRadius: '10px 0 0 0' }}>#</th>
                                <th className="py-3" style={{ backgroundColor: '#1565c0', color: 'white' }}>Aluno(a)</th>
                                <th className="py-3" style={{ backgroundColor: '#1565c0', color: 'white' }}>E-mail</th>
                                <th className="py-3" style={{ backgroundColor: '#1565c0', color: 'white' }}>Matrícula</th>
                                <th className="py-3 text-center" style={{ backgroundColor: '#1565c0', color: 'white' }}>Formulários<br />Preenchidos</th>
                                <th className="py-3 text-end pe-4" style={{ backgroundColor: '#1565c0', color: 'white', borderRadius: '0 10px 0 0' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaAlunos.map((aluno, index) => (
                                <tr key={aluno.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td className="ps-3 fw-bold text-muted">{index + 1}</td>
                                    <td className="text-secondary fw-medium">{aluno.nome}</td>
                                    <td className="text-muted">{aluno.email}</td>
                                    <td className="text-muted">{aluno.matricula}</td>
                                    <td className="text-center text-muted">{aluno.forms}</td>
                                    <td className="text-end pe-3">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="d-inline-flex align-items-center gap-2 px-3 py-2 fw-bold"
                                            style={{ backgroundColor: '#1565c0', borderColor: '#1565c0' }}
                                            onClick={() => alert(`Preencher formulário para ${aluno.nome}`)}
                                        >
                                            <FaFileAlt /> Preencher Formulário
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
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

export default AlunosTutor;