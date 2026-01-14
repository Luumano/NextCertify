import { Container, Row, Col, Card, Button, Navbar, Nav, Image, Table, ListGroup, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import LogoNextCertify from '../img/NextCertify.png';
import { useState, useEffect } from 'react';
import { FaUserCircle, FaFilePdf, FaFileCsv, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import { FaBell } from 'react-icons/fa6';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import mockData from '/src/mocks/relatorio-individual-aluno-mock';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useAuthenticatedUser from '../hooks/useAuthenticatedUser';
import authMock from '/src/mocks/auth-mock.json';

function RelatorioIndividualAluno() {
    const navigate = useNavigate();
    const { usuario, handleLogout } = useAuthenticatedUser();

    // Estados inicializados como vazios
    const [dadosDashboard, setDadosDashboard] = useState({
        usuario: { name: "" },
        metricas: [],
        graficos: [],
        experienciaGrafico: [],
        horasCertificado: []
    });

    const [alunos, setAlunos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAlunos, setFilteredAlunos] = useState([]);
    const [alunoSelecionado, setAlunoSelecionado] = useState(null);

    useEffect(() => {
        const alunoAtual = alunoSelecionado || usuario;
        if (!alunoAtual) return;

        const listaGlobalCertificados = JSON.parse(localStorage.getItem("lista_global_certificados")) || [];
        const meusCertificados = listaGlobalCertificados.filter(c => String(c.alunoId) === String(alunoAtual.id));

        const avaliacoes = JSON.parse(localStorage.getItem("@App:avaliacao") || "[]");
        const minhasAvaliacoes = avaliacoes.filter(a => a.email === alunoAtual.email);

        const metricas = [
            { label: "Tutorando", val: alunoAtual.name, icon: "🧑‍🎓" },
            { label: "Curso", val: alunoAtual.curso || "Não informado", icon: "💻" },
            { label: "Bolsista", val: "Carlos", icon: "👩‍🏫" },
            { label: "Encontros Realizados", val: minhasAvaliacoes.length > 0 ? minhasAvaliacoes.length.toString() : "0", icon: "📅" },
            { label: "Certificados", val: meusCertificados.length > 0 ? meusCertificados.length.toString() : "0", icon: "🏅" },
            { label: "Mantém tutoria?", val: minhasAvaliacoes.length > 0 ? (minhasAvaliacoes[minhasAvaliacoes.length - 1].permanecer === 'sim' ? 'Sim' : 'Não') : 'Não informado', icon: "📚" },
            { label: "Maior dificuldade", val: minhasAvaliacoes.length > 0 ? minhasAvaliacoes[minhasAvaliacoes.length - 1].dificuldade : 'Não informado', icon: "🤯" },
            { label: "Avaliação do Tutor", val: minhasAvaliacoes.length > 0 ? `${Math.round(minhasAvaliacoes.reduce((sum, a) => sum + parseInt(a.avaliacaoTutor || 0), 0) / minhasAvaliacoes.length)}%` : 'Não informado', icon: "🏅" }
        ];

        const horasPorMes = {};
        meusCertificados.forEach(cert => {
            const mes = new Date(cert.periodo).toLocaleString('default', { month: 'short' });
            if (!horasPorMes[mes]) horasPorMes[mes] = { estudos: 0, eventos: 0, monitoria: 0 };
            const categoria = cert.titulo.toLowerCase().includes('estudo') ? 'estudos' : cert.titulo.toLowerCase().includes('evento') ? 'eventos' : 'monitoria';
            horasPorMes[mes][categoria] += parseInt(cert.horas) || 0;
        });
        const horasCertificado = Object.keys(horasPorMes).length > 0 ? Object.keys(horasPorMes).map(mes => ({ name: mes, ...horasPorMes[mes] })) : mockData.horasCertificado; // Fallback to mock if no data

        // Experiência gráfico (boa/ruim baseado em experiencia >50)
        const experienciaPorMes = {};
        minhasAvaliacoes.forEach(av => {
            const mes = new Date(av.data).toLocaleString('default', { month: 'short' });
            if (!experienciaPorMes[mes]) experienciaPorMes[mes] = { boa: 0, ruim: 0 };
            if (parseInt(av.experiencia) > 50) experienciaPorMes[mes].boa++;
            else experienciaPorMes[mes].ruim++;
        });
        const experienciaGrafico = Object.keys(experienciaPorMes).length > 0 ? Object.keys(experienciaPorMes).map(mes => ({ name: mes, ...experienciaPorMes[mes] })) : mockData.experienciaGrafico;

        const encontrosPorMes = {};
        minhasAvaliacoes.forEach(av => {
            const mes = new Date(av.data).toLocaleString('default', { month: 'short' });
            if (!encontrosPorMes[mes]) encontrosPorMes[mes] = { online: 0, presencial: 0 };
            encontrosPorMes[mes].online++;
        });
        const graficos = Object.keys(encontrosPorMes).length > 0 ? Object.keys(encontrosPorMes).map(mes => ({ name: mes, ...encontrosPorMes[mes] })) : mockData.graficos;

        setDadosDashboard({
            usuario: { name: alunoAtual.name },
            metricas,
            graficos,
            experienciaGrafico,
            horasCertificado
        });

        setAlunos(authMock.users.filter(u => u.role === 'aluno'));
    }, [usuario, alunoSelecionado]);

    useEffect(() => {
        setFilteredAlunos(alunos.filter(aluno => 
            aluno.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            aluno.matricula.includes(searchTerm)
        ));
    }, [searchTerm, alunos]);

    const downloadCSV = () => {
        let csv = "";
        csv += "Relatório Aluno\n\n";
        csv += "Resumo Geral\n";
        csv += "Indicador,Valor\n";
        dadosDashboard.metricas.forEach(m => {
            csv += `${m.label},${m.val}\n`;
        });

        csv += "\n";
        csv += "Certificados\n";
        csv += "Título,Período,Horas,Status\n";
        const listaGlobalCertificados = JSON.parse(localStorage.getItem("lista_global_certificados")) || [];
        const meusCertificados = listaGlobalCertificados.filter(c => String(c.alunoId) === String(usuario.id));
        meusCertificados.forEach(c => {
            csv += `${c.titulo},${c.periodo},${c.horas},${c.status}\n`;
        });

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${dadosDashboard.usuario.name}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Relatório Aluno", 14, 20);
        doc.setFontSize(12);
        doc.text(`Aluno: ${dadosDashboard.usuario.name}`, 14, 30);
        doc.setFontSize(14);
        doc.text("Resumo Geral", 14, 45);

        autoTable(doc, {
            startY: 50,
            head: [["Indicador", "Valor"]],
            body: dadosDashboard.metricas.map(m => [m.label, m.val])
        });

        doc.setFontSize(14);
        doc.text(
            "Certificados",
            14,
            doc.lastAutoTable.finalY + 15
        );

        const listaGlobalCertificados = JSON.parse(localStorage.getItem("lista_global_certificados")) || [];
        const meusCertificados = listaGlobalCertificados.filter(c => String(c.alunoId) === String(usuario.id));

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [["Título", "Período", "Horas", "Status"]],
            body: meusCertificados.map(c => [
                c.titulo,
                c.periodo,
                c.horas,
                c.status
            ])
        });

        // Rodapé
        doc.setFontSize(10);
        doc.text(
            "© 2025 - NextCertify",
            14,
            doc.internal.pageSize.height - 10
        );

        doc.save("relatorio_aluno.pdf");
    };

    const gradientStyle = { background: 'linear-gradient(90deg, #005bea 0%, #00c6fb 100%)', color: 'white' };
    const cardHeaderStyle = { fontSize: '0.85rem', color: '#0056b3', fontWeight: 'bold' };
    const valueStyle = { fontSize: '1.2rem', fontWeight: '500', color: '#555' };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <Navbar bg="white" expand="lg" className="shadow-sm py-3 mb-4">
                <Container fluid className="px-5">
                    <Navbar.Brand href="#"><Image src={LogoNextCertify} alt="Logo" height="40" /></Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="text-center mx-auto fw-medium">
                            <Nav.Link href="#" className="mx-2 text-dark">Alunos</Nav.Link>
                            <Nav.Link href="#" className="mx-2 text-dark">Tutores</Nav.Link>
                            <Nav.Link href="#" className="mx-2 text-dark">Predefinições</Nav.Link>
                            <Nav.Link href="/contato" className="mx-2 text-dark">Contato</Nav.Link>
                        </Nav>
                        <div className="d-flex align-items-center gap-3">
                            <FaBell size={20} className="text-primary" style={{ cursor: 'pointer' }} />
                            <div className="d-flex align-items-center gap-2">
                                <FaUserCircle size={32} className="text-primary" />
                                <span className="fw-bold text-dark">{dadosDashboard.usuario.name}</span>
                            </div>
                            <Button variant="outline-danger" size="sm" onClick={handleLogout} className="d-flex align-items-center gap-2">
                                <FaSignOutAlt size={16} /> Sair
                            </Button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="flex-grow-1">
                <h2 className="text-primary fw-bold mb-4" style={{ fontSize: '2.5rem' }}>
                    Relatório {alunoSelecionado ? `de ${alunoSelecionado.name}` : 'Aluno'}
                    {alunoSelecionado && (
                        <Button variant="outline-secondary" size="sm" className="ms-3" onClick={() => setAlunoSelecionado(null)}>
                            Voltar ao Meu Relatório
                        </Button>
                    )}
                </h2>

                {/* Métricas Superiores */}
                <Row className="g-3 mb-4">
                    {dadosDashboard.metricas.length > 0 ? (
                        dadosDashboard.metricas.map((item, idx) => (
                            <Col key={idx} md={3}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div style={cardHeaderStyle}>{item.label}</div>
                                            <div style={valueStyle}>{item.val}</div>
                                        </div>
                                        <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Col><p className="text-muted">Nenhuma métrica encontrada no sistema.</p></Col>
                    )}
                </Row>

                {/* Gráficos */}
                <Row className="mb-4 g-4">
                    <Col md={6}>
                        <Card className="border-0 shadow-sm p-3 h-100">
                            <h6 className="fw-bold text-dark">Encontros Realizados</h6>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={dadosDashboard.graficos}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="online" stroke="#00c6fb" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="presencial" stroke="#005bea" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="border-0 shadow-sm p-3 h-100">
                            <h6 className="fw-bold text-dark">Experiência da Tutoria</h6>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={dadosDashboard.experienciaGrafico}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="boa" stroke="#28a745" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="ruim" stroke="#dc3545" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                {/* Tabela e Lista de Dificuldades */}
                <Row className="mb-5 g-4">
                    <Col md={6}>
                        <Card className="border-0 shadow-sm p-3 h-100">
                            <h6 className="fw-bold text-dark">Horas por Certificado</h6>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={dadosDashboard.horasCertificado}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="estudos" stroke="#2563eb" strokeWidth={3} />
                                    <Line type="monotone" dataKey="eventos" stroke="#06b6d4" strokeWidth={3} />
                                    <Line type="monotone" dataKey="monitoria" stroke="#6366f1" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="border-0 shadow-sm p-3 h-100">
                            <h6 className="fw-bold text-dark">Pesquisar Alunos Cadastrados</h6>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Buscar por nome ou matrícula"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {filteredAlunos.length > 0 ? (
                                    <ListGroup variant="flush">
                                        {filteredAlunos.map(aluno => (
                                            <ListGroup.Item key={aluno.id} className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>{aluno.name}</strong> - {aluno.matricula}
                                                </div>
                                                <Button variant="outline-primary" size="sm" onClick={() => setAlunoSelecionado(aluno)}>
                                                    <FaSearch /> Ver Relatório
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                ) : (
                                    <p className="text-muted">Nenhum aluno encontrado.</p>
                                )}
                            </div>
                        </Card>
                    </Col>

                </Row>

                <div className="d-flex gap-3 mb-5">
                    <Button variant="primary" className="px-5 py-2 fw-bold d-flex align-items-center gap-2 border-0" style={{ backgroundColor: '#1a56db' }} onClick={downloadPDF}>
                        <FaFilePdf /> Baixar PDF
                    </Button>
                    <Button variant="info" className="px-5 py-2 fw-bold text-white d-flex align-items-center gap-2 border-0" style={{ backgroundColor: '#06b6d4' }} onClick={downloadCSV}>
                        <FaFileCsv /> Baixar CSV
                    </Button>
                </div>
            </Container>
            <footer style={{ ...gradientStyle, padding: '30px 0', textAlign: 'center' }} className="mt-auto">
                <Container><h5 className="mb-0">© 2025 - NextCertify</h5></Container>
            </footer>
        </div>
    );
}

export default RelatorioIndividualAluno;