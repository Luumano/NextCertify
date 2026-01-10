import { Container, Row, Col, Card, Button, Navbar, Nav, Image, Table, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import LogoNextCertify from '../img/NextCertify.png';
import { useState, useEffect } from 'react';
import { FaUserCircle, FaFilePdf, FaFileCsv, FaSignOutAlt } from 'react-icons/fa';
import { FaBell } from 'react-icons/fa6';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import mockData from '/src/mocks/relatorio-mock.json';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



function RelatoriosCoordenador() {
    const navigate = useNavigate();

    // Estados inicializados como vazios
    const [dadosDashboard, setDadosDashboard] = useState({
        usuario: { name: "" },
        metricas: [],
        graficos: [],
        horasCertificado: [],
        dificuldadesGrafico: [],
        tutores: [],
        tutorandos: [],
        dificuldades: []
    });

    useEffect(() => {
        const baseDados = { ...mockData };
        const relatoriosTutores = JSON.parse(localStorage.getItem("relatorios_cadastrados") || "[]");
        const avaliacoesReais = JSON.parse(localStorage.getItem("@App:avaliacoes") || "[]");
        const certificadosGlobais = JSON.parse(localStorage.getItem("lista_global_certificados") || "[]");
        const aprovados = certificadosGlobais.filter(c => c.status === 'aprovado' || c.status === 'Aprovado');
        const totalRelatorios = relatoriosTutores.length || 1;

        const counts = { conteudo: 0, acesso: 0, funcionamento: 0, outras:0 };
        relatoriosTutores.forEach(rel => {
            if (rel.dificuldadeTipo === 'conteudo') counts.conteudo++;
            if (rel.dificuldadeTipo === 'acesso') counts.acesso++;
            // Adicione outras verificações conforme seu formulário
        });

        const novasDificuldades = [
            { titulo: "Dificuldades Acadêmicas", desc: "Conteúdos específicos", perc: `${((counts.conteudo / totalRelatorios) * 100).toFixed(0)}%`, icon: "📚" },
            { titulo: "Funcionamento da Universidade", desc: "Processos internos", perc: `${((counts.funcionamento / totalRelatorios) * 100).toFixed(0)}%`, icon: "🏫" },
            { titulo: "Acesso a serviços", desc: "Portais e sistemas", perc: `${((counts.acesso / totalRelatorios) * 100).toFixed(0)}%`, icon: "🔐" },
            { titulo: "Outras dificuldades", desc: "Diversos", perc: `${((counts.outras / totalRelatorios) * 100).toFixed(0)}%`, icon: "❓" }
        ];

        const categoriasHoras = { estudos: 0, eventos: 0, monitoria: 0};
        aprovados.forEach(c => {
            const h = parseFloat(c.horas) || 0;
            if(c.titulo.toLowerCase().includes('monitoria')) categoriasHoras.monitoria += h;
            else if(c.titulo.toLowerCase().includes('evento')) categoriasHoras.eventos += h;
            else categoriasHoras.estudos += h;
        });

        baseDados.horasCertificado = [
            { name: 'Total Horas', estudos: categoriasHoras.estudos, eventos: categoriasHoras.eventos, monitoria: categoriasHoras.monitoria }
        ];

        if(relatoriosTutores.length > 0){
            if(baseDados.metricas[2]){
                baseDados.metricas[2].val = aprovados.length;
            }

            const listaTutorandosRelatorios = relatoriosTutores.map(rel => ({
                id: rel.matricula,
                nome: rel.aluno,
                encontros: rel.encontrosTotais || 1,
                semestre: "2025.1"
            }));

            const mapaTutores = {};
            relatoriosTutores.forEach(rel => {
                const nome = rel.tutorNome || "Tutor não identificado";
                if(!mapaTutores[nome]){
                    mapaTutores[nome] = { 
                        id: rel.tutorMatricula, 
                        nome: nome, 
                        encontros: 0, 
                        semestre: "2025.1"
                    };
                }
                mapaTutores[nome].encontros += Number(rel.encontrosTotais || 1);
            });

            baseDados.tutores = Object.values(mapaTutores);
            baseDados.tutorandos = listaTutorandosRelatorios;

            const counts = { conteudo: 0, acesso: 0, nenhuma: 0, outras: 0};
            relatoriosTutores.forEach(rel => {
                if(counts[rel.dificuldadeTipo] !== undefined){
                    counts[rel.dificuldadeTipo]++;
                }
            });

            baseDados.graficoDificuldades = [
                { name: 'Conteúdo', sim: counts.conteudo, nao: relatoriosTutores.length - counts.conteudo },
                { name: 'Acesso', sim: counts.acesso, nao: relatoriosTutores.length - counts.acesso },
                { name: 'Outras', sim: counts.outras, nao: relatoriosTutores.length - counts.outras },
            ];
        }

        if(avaliacoesReais.length > 0){
            if(baseDados.metricas[0]) {
                baseDados.metricas[0].val = avaliacoesReais.length;
            }

            const novosTutorandos = avaliacoesReais.map(av => ({
                id: av.email ? av.email.split('@')[0] : "AVAL",
                nome: av.nome,
                encontros: 1,
                semestre: "2025.1"
            }));

            baseDados.tutorandos = [...baseDados.tutorandos, ...novosTutorandos];
        }

        const novasMetricas = [
            { label: "Tutorandos Ativos", val: avaliacoesReais.length, icon: "🎓" },
            { label: "Tutores", val: relatoriosTutores.length, icon: "🏫" },
            { label: "Experiência da Tutoria", val: avaliacoesReais.length, icon: "😊" },
            { label: "Encontros Realizados", val: relatoriosTutores.reduce((acc, curr) => acc + Number(curr.encontrosTotais || 0), 0), icon: "📅" },
            { label: "Certificados", val: certificadosGlobais.length, icon: "🏅" }
        ];

        setDadosDashboard(prev => ({
            ...prev,
            dificuldades: novasDificuldades
        }));

        setDadosDashboard(prev => ({
            ...prev,
            metricas: novasMetricas
        }));

        setDadosDashboard({
            ...baseDados,
            usuario: { name: "Coordenador Geral" }
        });
    }, []);

    const downloadCSV = () => {
        let csv = "";

        // Título do CSV
        csv += "Relatório de Gestão Geral\n\n";

        //resumo e métricas
        csv += "Resumo Geral\n";
        csv += "Indicador,Valor\n";
        dadosDashboard.metricas.forEach(m => {
            csv += `${m.label},${m.val}\n`
        });

        csv += "\n";

        //Tutorandos
        csv += "Tutorandos\n";
        csv += "Matrícula,Nome,Encontros,Semestre\n";
        dadosDashboard.tutorandos.forEach(t => {
            csv += `${t.id},${t.nome},${t.encontros},${t.semestre}\n`
        });

        csv += "\n";

        //Tutores
        if(dadosDashboard.tutores?.length) {
            csv += "Tutores\n";
            csv += "Nome,Encontros\n";
            dadosDashboard.tutores.forEach(t => {
                csv += `${t.nome},${t.encontros}\n`;
            });
            csv += "\n";
        }

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
        link.download = "relatorio_gestao_geral.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

         // Título
        doc.setFontSize(18);
        doc.text("Relatório de Gestão Geral", 14, 20);

        // Subtítulo
        doc.setFontSize(12);
        doc.text(`Coordenador: ${dadosDashboard.usuario.name}`, 14, 30);

        // Métricas
        doc.setFontSize(14);
        doc.text("Resumo Geral", 14, 45);

        autoTable(doc, {
            startY: 50,
            head: [["Indicador", "Valor"]],
            body: dadosDashboard.metricas.map(m => [m.label, m.val])
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

        doc.save("relatorio_gestao_geral.pdf");
    };

    const handleLogout = () => {
            localStorage.removeItem("usuarioLogado");
            navigate('/');
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
                <h2 className="text-primary fw-bold mb-4" style={{ fontSize: '2.5rem' }}>Relatório de Gestão Geral</h2>

                {/* Métricas Superiores */}
                <Row className="g-3 mb-4">
                    {dadosDashboard.metricas.length > 0 ? (
                        dadosDashboard.metricas.map((item, idx) => (
                            <Col key={idx} md>
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
                                <LineChart data={dadosDashboard.graficos}>
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

                    <Col md={6}>
                        <Card className="border-0 shadow-sm p-3 h-100">
                            <h6 className="fw-bold text-dark">Apresentou Dificuldades</h6>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={dadosDashboard.dificuldadesGrafico}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="sim" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="nao" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                <Row className="mb-5">
    <Col md={12}>
        <Card className="border-0 shadow-sm p-3">
            <h6 className="fw-bold mb-3">Certificados Enviados pelos Alunos (Validação)</h6>
            <Table hover responsive borderless size="sm" className="text-muted">
                <thead className="border-bottom">
                    <tr>
                        <th>Aluno</th>
                        <th>Título</th>
                        <th>Horas</th>
                        <th>Data</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {JSON.parse(localStorage.getItem("lista_global_certificados") || "[]").map((cert, i) => (
                        <tr key={i}>
                            <td>{cert.alunoNome}</td>
                            <td>{cert.titulo}</td>
                            <td>{cert.horas}h</td>
                            <td>{cert.periodo}</td>
                            <td>
                                <Badge bg={cert.status === 'aprovado' ? 'success' : 'warning'}>
                                    {cert.status}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card>
    </Col>
</Row>

                {/* Tabela e Lista de Dificuldades */}
                <Row className="mb-5 g-4">
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

                    <Col md={6}>
                        <Card className="border-0 shadow-sm p-3 mb-4">
                            <h6 className="fw-bold mb-3">Tutores</h6>
                            <Table hover responsive borderless size="sm" className="text-muted">
                                <thead className="border-bottom">
                                    <tr><th>Matrícula</th><th>Nome</th><th>Encontros</th><th>Semestre</th></tr>
                                </thead>
                                <tbody>
                                    {dadosDashboard.tutores.map((tutores, e) => (
                                        <tr key={e}>
                                            <td>{tutores.id}</td>
                                            <td>{tutores.nome}</td>
                                            <td>{tutores.encontros}</td>
                                            <td>{tutores.semestre}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card>
                    </Col>

                    <Col md={6}>
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

export default RelatoriosCoordenador;