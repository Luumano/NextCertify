import { Container, Row, Col, Button, Navbar, Nav, Form, Image, Card } from 'react-bootstrap';
import { FaBell, FaUserCircle, FaSignOutAlt, FaSave, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LogoNextCertify from '../img/NextCertify.png';
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";

function Predefinicoes() {
    const { usuario, handleLogout } = useAuthenticatedUser();

    if (!usuario) {
        return <div className="p-5 text-center">Carregando...</div>;
    }

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

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
                            <Nav.Link href="/registro-aluno" className="mx-2 text-dark">Alunos</Nav.Link>
                            <Nav.Link href="/registro-tutores" className="mx-2 text-dark">Tutores</Nav.Link>
                            <Nav.Link href="/predefinicoes" className="mx-2 text-dark">Predefinições</Nav.Link>
                            <Nav.Link href="/contato" className="mx-2 text-dark">Contato</Nav.Link>
                        </Nav>
                        <div className="d-flex align-items-center gap-3">
                            <FaBell size={20} className="text-primary" style={{ cursor: 'pointer' }} />
                            <div className="d-flex align-items-center gap-2">
                                <FaUserCircle size={32} className="text-primary" />
                                <span className="fw-bold text-dark">{usuario.name}</span>
                            </div>
                            <Button variant="outline-danger" size="sim" className="d-flex align-items-center gap-2" onClick={handleLogout}><FaSignOutAlt size={16} /> Sair</Button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="my-5 flex-grow-1">
                <h1 className="fw-bold mb-3" style={{ color: '#0f52ba' }}>Predefinições</h1>

                <Form className='mb-3'>
                    <Row className='mb-3'>
                        <h2 style={{ color: '#0f52ba' }}>Alunos</h2>

                        <Col md={6} className='mb-3'>
                            <Form.Group controlId='categoria'>
                                <Form.Label className='fw-medium' style={{ color: '#0f52ba', fontSize: '1.1rem' }}>Categoria</Form.Label>
                                <Form.Select defaultValue="Selecione a categoria" required>
                                    <option value="">Selecione a categoria</option>
                                    <option value="estudos">Estudos individuais</option>
                                    <option value="monitoria">Monitoria</option>
                                    <option value="evento">Eventos</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId='carga-horaria'>
                                <Form.Label className='fw-medium' style={{ color: '#0f52ba', fontSize: '1.1rem' }}>Carga horária mínima</Form.Label>

                                <Form.Control type='number' min={0} disabled></Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end">
                        <Button variant="primary" type="submit" style={{ borderRadius: '.4rem' }}>
                            Salvar
                        </Button>
                    </div>
                </Form>

                <Form className='mb-4'>
                    <Row className='mb-3'>
                        <h2 style={{ color: '#0f52ba' }}>Tutoria</h2>

                        <Col md={6} className='mb-3'>
                            <Form.Group controlId='data-inicio'>
                                <Form.Label className='fw-medium' style={{ color: '#0f52ba', fontSize: '1.1rem' }}>Data de início</Form.Label>

                                <Form.Control type='date'></Form.Control>
                            </Form.Group>
                        </Col>

                        <Col md={6} className='mb-3'>
                            <Form.Group controlId='data-fim'>
                                <Form.Label className='fw-medium' style={{ color: '#0f52ba', fontSize: '1.1rem' }}>Data final</Form.Label>

                                <Form.Control type='date'></Form.Control>
                            </Form.Group>
                        </Col>

                        <Col md={6} className='mb-3'>
                            <Form.Group controlId='tutor'>
                                <Form.Label className='fw-medium' style={{ color: '#0f52ba', fontSize: '1.1rem' }}>Tutor</Form.Label>
                                <Form.Select defaultValue="Selecione a categoria" required>
                                    <option value="">Selecione o tutor</option>
                                    <option value="...">...</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6} className='mb-3'>
                            <Form.Group controlId='tutor'>
                                <Form.Label className='fw-medium' style={{ color: '#0f52ba', fontSize: '1.1rem' }}>Tutor</Form.Label>
                                <Form.Select defaultValue="Selecione a categoria" required>
                                    <option value="">Selecione o tutor</option>
                                    <option value="...">...</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end">
                        <Button variant="primary" type="submit" style={{ borderRadius: '.4rem' }}>
                            Salvar
                        </Button>
                    </div>
                </Form>

                <Card className='mb-3'>
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex flex-column">
                                <h4 className='text-primary'>Tutor: Germano</h4>
                                <p className='mb-0'><strong>Aluno:</strong> Ícaro</p>
                                <p><strong>Matrícula:</strong> 12345</p>
                            </div>

                            <div>
                                <Button variant="danger">
                                    Remover
                                </Button>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            <footer style={{ background: 'linear-gradient(90deg, #005bea 0%, #00c6fb 100%)', padding: '30px 0', textAlign: 'center', color: 'white' }} className="mt-auto">
                <Container>
                    <h5 className="mb-0">© 2025 - NextCertify</h5>
                </Container>
            </footer>
        </div>
    );
}

export default Predefinicoes;