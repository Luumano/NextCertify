import { Container, Row, Col, Card, Button, Navbar, Nav, Image, Table, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import LogoNextCertify from '../img/NextCertify.png';
import { useState, useEffect } from 'react';
import { FaUserCircle, FaFilePdf, FaFileCsv, FaSignOutAlt } from 'react-icons/fa';
import { FaBell } from 'react-icons/fa6';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import mockData from '/src/mocks/relatorio-geral-tutor-mock';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useAuthenticatedUser from '../hooks/useAuthenticatedUser';
import authMock from '../mocks/auth-mock.json';

function RelatorioGeralTutor() {
    const navigate = useNavigate();
    const { usuario, handleLogout } = useAuthenticatedUser();

    // Estados inicializados como vazios
    const [dadosDashboard, setDadosDashboard] = useState({
        usuario: { name: "" },
        metricas: [],
        graficos: [],
        experienciaGrafico: [],
        dificuldadesGrafico: [],
        dificuldades: [],
        tutores: [],
        tutorandos: []
    });

    useEffect(() => {
        if (!usuario) return;

        // Carregar relatórios de tutores
        const relatorios = JSON.parse(localStorage.getItem("relatorios_cadastrados") || "[]");

        // Calcular métricas
        const totalTutorandos = new Set(relatorios.map(r => r.aluno)).size;
        const totalEncontros = relatorios.reduce((sum, r) => sum + (r.encontrosTotais || 0), 0);
        const totalTutores = authMock.users.filter(u => u.role === 'tutor').length;

        const metricas = [
            { label: "Tutorandos", val: totalTutorandos.toString(), icon: "🧑‍🎓" },
            { label: "Encontros Realizados", val: totalEncontros.toString(), icon: "📅" },
            { label: "Tutores Cadastrados", val: totalTutores.toString(), icon: "👨‍🏫" }
        ];

        // Gráficos de encontros (agregar por mês)
        const encontrosPorMes = {};
        relatorios.forEach(r => {
            const mes = new Date(r.data).toLocaleString('default', { month: 'short' });
            if (!encontrosPorMes[mes]) encontrosPorMes[mes] = { total: 0 };
            encontrosPorMes[mes].total += r.encontrosTotais || 0;
        });
        const graficos = Object.keys(encontrosPorMes).length > 0 ? Object.keys(encontrosPorMes).map(mes => ({ name: mes, ...encontrosPorMes[mes] })) : mockData.graficos;

        // Experiência gráfico
        const experienciaPorMes = {};
        relatorios.forEach(r => {
            if (r.detalhes && r.detalhes.experiencia) {
                const mes = new Date(r.data).toLocaleString('default', { month: 'short' });
                if (!experienciaPorMes[mes]) experienciaPorMes[mes] = { boa: 0, ruim: 0 };
                if (parseInt(r.detalhes.experiencia) > 50) experienciaPorMes[mes].boa++;
                else experienciaPorMes[mes].ruim++;
            }
        });
        const experienciaGrafico = Object.keys(experienciaPorMes).length > 0 ? Object.keys(experienciaPorMes).map(mes => ({ name: mes, ...experienciaPorMes[mes] })) : mockData.experienciaGrafico;

        // Dificuldades gráfico
        const dificuldadesPorMes = {};
        relatorios.forEach(r => {
            const mes = new Date(r.data).toLocaleString('default', { month: 'short' });
            if (!dificuldadesPorMes[mes]) dificuldadesPorMes[mes] = { sim: 0, nao: 0 };
            if (r.dificuldadeTipo && r.dificuldadeTipo !== 'selecionar') dificuldadesPorMes[mes].sim++;
            else dificuldadesPorMes[mes].nao++;
        });
        const dificuldadesGrafico = Object.keys(dificuldadesPorMes).length > 0 ? Object.keys(dificuldadesPorMes).map(mes => ({ name: mes, ...dificuldadesPorMes[mes] })) : mockData.dificuldadesGrafico;

        // Dificuldades (contar tipos)
        const dificuldadesCount = {};
        relatorios.forEach(r => {
            if (r.dificuldadeTipo) {
                dificuldadesCount[r.dificuldadeTipo] = (dificuldadesCount[r.dificuldadeTipo] || 0) + 1;
            }
        });
        const totalDificuldades = relatorios.length;
        const dificuldades = Object.keys(dificuldadesCount).map(tipo => ({
            icon: "📚", // Placeholder
            titulo: tipo,
            desc: "Descrição",
            perc: totalDificuldades > 0 ? `${Math.round((dificuldadesCount[tipo] / totalDificuldades) * 100)}%` : "0%"
        }));

        // Tutores e Alunos do auth-mock
        const tutores = authMock.users.filter(u => u.role === 'tutor').map(u => ({
            id: u.matricula,
            nome: u.name,
            encontros: relatorios.filter(r => r.tutorMatricula === u.matricula).reduce((sum, r) => sum + (r.encontrosTotais || 0), 0),
            semestre: "2024.1" // Placeholder
        }));

        const alunos = authMock.users.filter(u => u.role === 'aluno').map(u => ({
            id: u.matricula,
            nome: u.name,
            encontros: relatorios.filter(r => r.matricula === u.matricula).reduce((sum, r) => sum + (r.encontrosTotais || 0), 0),
            semestre: "2024.1" // Placeholder
        }));

        setDadosDashboard({
            usuario: { name: usuario.name },
            metricas,
            graficos,
            experienciaGrafico,
            dificuldadesGrafico,
            dificuldades,
            tutores,
            tutorandos: alunos
        });
    }, [usuario]);

    const downloadCSV = () => {
        let csv = "";

        // Título do CSV
        csv += "Relatório Geral de Tutores\n\n";

        //resumo e métricas
        csv += "Resumo Geral\n";
        csv += "Indicador,Valor\n";
        dadosDashboard.metricas.forEach(m => {
            csv += `${m.label},${m.val}\n`;
        });

        csv += "\n";

        //Tutores
        csv += "Tutores\n";
        csv += "Matrícula,Nome,Encontros,Semestre\n";
        dadosDashboard.tutores.forEach(t => {
            csv += `${t.id},${t.nome},${t.encontros},${t.semestre}\n`;
        });

        csv += "\n";

        //Tutorandos
        csv += "Tutorandos\n";
        csv += "Matrícula,Nome,Encontros,Semestre\n";
        dadosDashboard.tutorandos.forEach(t => {
            csv += `${t.id},${t.nome},${t.encontros},${t.semestre}\n`;
        });

        csv += "\n";

        //Dificuldades
        csv += "Maiores Dificuldades dos Tutorandos\n";
        csv += "Dificuldade,Percentual\n";
        dadosDashboard.dificuldades.forEach(d => {
            csv += `${d.titulo},${d.perc}\n`;
        });

        //Download
        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "relatorio_geral_tutor.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        // Título
        doc.setFontSize(18);
        doc.text("Relatório Geral de Tutores", 14, 20);

        // Subtítulo
        doc.setFontSize(12);
        doc.text(`Tutor: ${dadosDashboard.usuario.name}`, 14, 30);

        // Métricas
        doc.setFontSize(14);
        doc.text("Resumo Geral", 14, 45);

        autoTable(doc, {
            startY: 50,
            head: [["Indicador", "Valor"]],
            body: dadosDashboard.metricas.map(m => [m.label, m.val])
        });

        // Tutores
        doc.setFontSize(14);
        doc.text(
            "Tutores",
            14,
            doc.lastAutoTable.finalY + 15
        );

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [["Matrícula", "Nome", "Encontros", "Semestre"]],
            body: dadosDashboard.tutores.map(t => [
                t.id,
                t.nome,
                t.encontros,
                t.semestre
            ])
        });

        // Tutorandos
        doc.setFontSize(14);
        doc.text(
            "Tutorandos",
            14,
            doc.lastAutoTable.finalY + 15
        );

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [["Matrícula", "Nome", "Encontros", "Semestre"]],
            body: dadosDashboard.tutorandos.map(t => [
                t.id,
                t.nome,
                t.encontros,
                t.semestre
            ])
        });

        // Dificuldades
        doc.setFontSize(14);
        doc.text(
            "Maiores Dificuldades dos Tutorandos",
            14,
            doc.lastAutoTable.finalY + 15
        );

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [["Dificuldade", "Percentual"]],
            body: dadosDashboard.dificuldades.map(d => [
                d.titulo,
                d.perc
            ])
        });

        // Rodapé
        doc.setFontSize(10);
        doc.text(
            "© 2025 - NextCertify",
            14,
            doc.internal.pageSize.height - 10
        );

        doc.save("relatorio_geral_tutor.pdf");
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
                <h2 className="text-primary fw-bold mb-4" style={{ fontSize: '2.5rem' }}>Relatório Tutor</h2>

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
                                    <Line type="monotone" dataKey="total" stroke="#00c6fb" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>


                    <Col md={6}>
                        <Card className="border-0 shadow-sm p-3 h-100">
                            <h6 className="fw-bold text-dark">Dificuldades Apresentadas</h6>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={dadosDashboard.dificuldadesGrafico}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="sim" stroke="#dc3545" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="nao" stroke="#28a745" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                {/* Tabela e Lista de Dificuldades */}
                <Row className="mb-5 g-4">
                    <Col md={6}>
                        <Card className="border-0 shadow-sm p-3 mb-4">
                            <h6 className="fw-bold mb-3">Tutores</h6>
                            <Table hover responsive borderless size="sm" className="text-muted">
                                <thead className="border-bottom">
                                    <tr><th>Matrícula</th><th>Nome</th><th>Encontros</th><th>Semestre</th></tr>
                                </thead>
                                <tbody>
                                    {dadosDashboard.tutores.map((tuto, i) => (
                                        <tr key={i}>
                                            <td>{tuto.id}</td>
                                            <td>{tuto.nome}</td>
                                            <td>{tuto.encontros}</td>
                                            <td>{tuto.semestre}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card>
                    </Col>

                    <Col md={6}>
                        <Card className="border-0 shadow-sm p-3 mb-4">
                            <h6 className="fw-bold mb-3">Tutorandos</h6>
                            <Table hover responsive borderless size="sm" className="text-muted">
                                <thead className="border-bottom">
                                    <tr><th>Matrícula</th><th>Nome</th><th>Encontros</th><th>Semestre</th></tr>
                                </thead>
                                <tbody>
                                    {dadosDashboard.tutorandos.map((tuto, i) => (
                                        <tr key={i}>
                                            <td>{tuto.id}</td>
                                            <td>{tuto.nome}</td>
                                            <td>{tuto.encontros}</td>
                                            <td>{tuto.semestre}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card>
                    </Col>

                    <Col md={12}>
                        <Card className="border-0 shadow-sm p-3">
                            <h6 className="fw-bold mb-3">Maiores dificuldades dos tutorandos</h6>
                            <ListGroup variant="flush">
                                {dadosDashboard.dificuldades.map((dif, i) => (
                                    <ListGroup.Item key={i} className="d-flex justify-content-between align-items-center border-0 px-0 mb-2">
                                        <div>{dif.icon} <strong>{dif.titulo}</strong><br /><small className="text-muted">{dif.desc}</small></div>
                                        <span className="fw-bold text-primary">{dif.perc}</span>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
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

export default RelatorioGeralTutor;