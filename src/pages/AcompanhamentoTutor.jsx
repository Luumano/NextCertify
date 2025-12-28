import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav, Image, Table, ListGroup, Form, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaFilePdf, FaFileCsv, FaSignOutAlt, FaBell, FaPaperPlane, FaEye } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import mockData from '/src/mocks/acompanhamento-mock.json'; 
import LogoNextCertify from '../img/NextCertify.png';

function AcompanhamentoTutor() {
    const navigate = useNavigate();
    
    const [tutorSelecionado, setTutorSelecionado] = useState("global");
    const [dadosAtuais, setDadosAtuais] = useState(mockData.stats.global);
    const [showModal, setShowModal] = useState(false);
    const [relatorioModal, setRelatorioModal] = useState(null);

    //Lógica de filtro 
    useEffect(() => {
        if (tutorSelecionado === "global") {
            setDadosAtuais(mockData.stats.global);
        } else if (mockData.stats[tutorSelecionado]) {
            setDadosAtuais(mockData.stats[tutorSelecionado]);
        }
    }, [tutorSelecionado]);

    const handleNotificar = (nome) => {
        alert(`Notificação enviada para: ${nome}`);
    };

    const visualizarRelatorio = (id) => {
        const rel = mockData.relatoriosEnviados.find(r => r.id === id);
        setRelatorioModal(rel);
        setShowModal(true);
    };

    const gradientStyle = { background: 'linear-gradient(90deg, #005bea 0%, #00c6fb 100%)', color: 'white' };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar bg="white" expand="lg" className="shadow-sm py-3 mb-4">
                <Container fluid className="px-5">
                    <Navbar.Brand href="#"><Image src={LogoNextCertify} alt="Logo" height="40" /></Navbar.Brand>
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav className="mx-auto fw-medium">
                            <Nav.Link href="#">Alunos</Nav.Link>
                            <Nav.Link href="#" className="text-primary fw-bold">Relatórios</Nav.Link>
                            <Nav.Link href="#">Tutores</Nav.Link>
                        </Nav>
                        <div className="d-flex align-items-center gap-3">
                            <FaBell className="text-primary" style={{ cursor: 'pointer' }} />
                            <div className="d-flex align-items-center gap-2">
                                <FaUserCircle size={32} className="text-primary" />
                                <span className="fw-bold">{mockData.usuario.name}</span>
                            </div>
                            <Button variant="outline-danger" size="sm" onClick={() => navigate('/')}><FaSignOutAlt /> Sair</Button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="flex-grow-1 pb-5">
                <Row className="align-items-end mb-4">
                    <Col md={8}>
                        <h2 className="text-primary fw-bold mb-0">Acompanhamento de Relatório dos Tutores</h2>
                        <p className="text-muted">Visualizando dados de: <strong>{tutorSelecionado === "global" ? "Todos os Tutores" : mockData.tutores.find(t => t.id.toString() === tutorSelecionado)?.nome}</strong></p>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="fw-bold text-dark small">SELECIONAR TUTOR</Form.Label>
                            <Form.Select 
                                value={tutorSelecionado}
                                onChange={(e) => setTutorSelecionado(e.target.value)}
                            >
                                <option value="global">Todos os Tutores (Geral)</option>
                                {mockData.tutores.map(t => (
                                    <option key={t.id} value={t.id}>{t.nome}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="g-3 mb-4">
                    {dadosAtuais?.metricas?.map((item, idx) => (
                        <Col key={idx} md={4}>
                            <Card className="border-0 shadow-sm">
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="text-muted small fw-bold">{item.label}</div>
                                        <div className="h4 mb-0 fw-bold">{item.val}</div>
                                    </div>
                                    <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row className="g-4">
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm p-4 mb-4">
                            <h6 className="fw-bold mb-4">Encontros Realizados</h6>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={dadosAtuais?.graficos || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="online" stroke="#00c6fb" strokeWidth={3} />
                                    <Line type="monotone" dataKey="presencial" stroke="#005bea" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>

                        <Card className="border-0 shadow-sm p-3">
                            <h6 className="fw-bold mb-3">Relatórios Recentes</h6>
                            <Table hover responsive borderless className="align-middle">
                                <thead>
                                    <tr className="text-muted small"><th>Tutor</th><th>Aluno</th><th>Data</th><th>Ações</th></tr>
                                </thead>
                                <tbody>
                                    {mockData.relatoriosEnviados.map(rel => (
                                        <tr key={rel.id} className="border-bottom">
                                            <td className="fw-bold text-primary">
                                                {mockData.tutores.find(t => t.id === rel.tutorId)?.nome}
                                            </td>
                                            <td>{rel.aluno}</td>
                                            <td>{rel.dataSubmissao}</td>
                                            <td>
                                                <Button variant="light" size="sm" onClick={() => visualizarRelatorio(rel.id)}>
                                                    <FaEye className="text-primary" /> Ver
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-white border-0 pt-3">
                                <h6 className="fw-bold text-danger">Pendências de Envio</h6>
                            </Card.Header>
                            <Card.Body>
                                <ListGroup variant="flush">
                                    {mockData.tutores.filter(t => t.pendente).map(t => (
                                        <ListGroup.Item key={t.id} className="d-flex justify-content-between align-items-center px-0">
                                            <div>
                                                <div className="fw-bold small">{t.nome}</div>
                                                <small className="text-muted">{t.email}</small>
                                            </div>
                                            <Button variant="outline-primary" size="sm" onClick={() => handleNotificar(t.nome)}>
                                                <FaPaperPlane />
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm p-3">
                            <h6 className="fw-bold mb-3">Dificuldades Relatadas</h6>
                            {dadosAtuais?.dificuldades?.map((dif, i) => (
                                <div key={i} className="mb-3 p-2 bg-light rounded">
                                    <div className="d-flex justify-content-between fw-bold">
                                        <span>{dif.icon} {dif.titulo}</span>
                                        <span className="text-primary">{dif.perc}</span>
                                    </div>
                                    <small className="text-muted">{dif.desc}</small>
                                </div>
                            ))}
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal de Detalhes do Relatório */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0"><Modal.Title className="text-primary fw-bold">Detalhes do Acompanhamento</Modal.Title></Modal.Header>
                <Modal.Body className="px-4 pb-4">
                    {relatorioModal && (
                        <Row className="g-3">
                            <Col md={12} className="mb-2">
                                <Badge bg="primary">Submetido em: {relatorioModal.dataSubmissao}</Badge>
                            </Col>
                            <Col md={6}><Form.Label className="small fw-bold">Aluno</Form.Label><Form.Control readOnly value={relatorioModal.aluno} /></Col>
                            <Col md={3}><Form.Label className="small fw-bold">Encontros Virtuais</Form.Label><Form.Control readOnly value={relatorioModal.detalhes.virtuais} /></Col>
                            <Col md={3}><Form.Label className="small fw-bold">Presenciais</Form.Label><Form.Control readOnly value={relatorioModal.detalhes.presenciais} /></Col>
                            <Col md={12}><Form.Label className="small fw-bold">Dificuldade Detectada</Form.Label><Form.Control readOnly value={relatorioModal.detalhes.dificuldadeLabel} /></Col>
                            <Col md={12}><Form.Label className="small fw-bold">Descrição</Form.Label><Form.Control as="textarea" rows={4} readOnly value={relatorioModal.detalhes.descricao} /></Col>
                        </Row>
                    )}
                </Modal.Body>
            </Modal>

            <footer style={{ ...gradientStyle, padding: '30px 0', textAlign: 'center' }} className="mt-auto">
                <Container>
                    <h5 className="mb-0">© 2025 - NextCertify</h5>
                </Container>
            </footer>
        </div>
    );
}

export default AcompanhamentoTutor;