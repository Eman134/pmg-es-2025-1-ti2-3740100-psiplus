import BotaoPadrao from "~/componentes/BotaoPadrao";
import { useNavigate, useParams } from "react-router";
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from "@mui/icons-material/Check";
import { useState, useEffect } from "react";
import axios from "axios";

interface Anotacao {
    data: string; // ISO string
    conteudo: string;
}

const ConsultationHistory: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const pacienteId = Number(id);

    const [modoEdicao, setModoEdicao] = useState(false);
    const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
    const [novoConteudo, setNovoConteudo] = useState("");
    const [dataConsulta, setDataConsulta] = useState("");
    const [horaConsulta, setHoraConsulta] = useState("");

    // Buscar histórico clínico do paciente ao montar o componente
    useEffect(() => {
        if (!pacienteId) return;

        axios
            .get(`http://localhost:8080/pacientes/${pacienteId}`)
            .then((res) => {
                const paciente = res.data;

                let historico: Anotacao[] = [];
                if (paciente.historicoClinico) {
                    try {
                        historico =
                            typeof paciente.historicoClinico === "string"
                                ? JSON.parse(paciente.historicoClinico)
                                : paciente.historicoClinico;
                    } catch (e) {
                        console.error("Erro ao converter histórico clínico:", e);
                        historico = [];
                    }
                }
                setAnotacoes(historico);
            })
            .catch((err) => {
                console.error("Erro ao carregar histórico do paciente:", err);
            });
    }, [pacienteId]);

    const handleAdicionarAnotacao = () => {
        const agora = new Date();
        const dataISO = agora.toISOString().split("T")[0]; // yyyy-mm-dd
        const hora = agora.toTimeString().slice(0, 5); // hh:mm

        setDataConsulta(dataISO);
        setHoraConsulta(hora);
        setModoEdicao(true);
    };

    const handleSalvar = async () => {
        if (!novoConteudo.trim()) return;

        const dataHoraCompleta = `${dataConsulta}T${horaConsulta}:00`;
        const nova: Anotacao = {
            data: new Date(dataHoraCompleta).toISOString(),
            conteudo: novoConteudo.trim(),
        };

        const novasAnotacoes = [nova, ...anotacoes];

        try {
            // Enviar as novas anotações, não as antigas!
            await axios.put(
                `http://localhost:8080/pacientes/${pacienteId}/historico-clinico`,
                novasAnotacoes // não 'anotacoes', use 'novasAnotacoes'
            );
            setAnotacoes(novasAnotacoes);
            setNovoConteudo("");
            setModoEdicao(false);
        } catch (error) {
            console.error("Erro ao salvar anotação:", error);
        }
    };

    const anotacoesOrdenadas = [...anotacoes].sort(
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    const formatarDataHora = (iso: string) => {
        const data = new Date(iso);
        return `${data.toLocaleDateString("pt-BR")} - ${data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        })}`;
    };

    return (
        <div className="max-w-[900px] mx-auto">
            <div className="flex justify-between items-center mb-5">
                {!modoEdicao ? (
                    <>
                    <h2 className="text-[17px] font-bold text-[#3A3F63]">HISTÓRICO DE CONSULTAS</h2>
                    <BotaoPadrao
                        texto="Adicionar Anotação"
                        className="cursor-pointer group bg-transparent !border-none !shadow-none !text-[#0088A3] flex items-center gap-1 hover:!text-[#006e85] text-base font-bold transition-colors"
                        handleClick={handleAdicionarAnotacao}
                        icone={<AddIcon style={{ color: "#0088A3" }} />}
                    />
                    </>
                ) : (
                    null
                )}
            </div>

            {modoEdicao ? (
                <>
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-[17px] font-bold text-[#3A3F63]">REGISTRO DE SESSÃO</h2>
                        <BotaoPadrao
                            texto="Salvar"
                            className="cursor-pointer group bg-transparent !border-none !shadow-none !text-[#0088A3] flex items-center gap-1 hover:!text-[#006e85] text-base font-bold transition-colors"
                            handleClick={handleSalvar}
                            icone={<SaveIcon style={{ color: "#0088A3" }} />}
                        />
                    </div>

                    <div className="mb-6 space-y-4">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex flex-col">
                                <label className="text-sm text-gray-600 mb-1">Data da Consulta</label>
                                <input
                                    type="date"
                                    value={dataConsulta}
                                    onChange={(e) => setDataConsulta(e.target.value)}
                                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm text-gray-600 mb-1">Horário da Consulta</label>
                                <input
                                    type="time"
                                    value={horaConsulta}
                                    onChange={(e) => setHoraConsulta(e.target.value)}
                                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div>
                        <textarea
                            rows={5}
                            placeholder="Insira alguma nota sobre esse paciente"
                            value={novoConteudo}
                            onChange={(e) => setNovoConteudo(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        </div>
                    </div>
                </>
            ) : anotacoes.length === 0 ? (
                <p className="text-sm text-[#333]">Nenhuma anotação registrada.</p>
            ) : (
                <ul className="space-y-4">
                    {anotacoesOrdenadas.map((anotacao, index) => (
                        <li key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-500">{formatarDataHora(anotacao.data)}</span>
                            </div>
                            <p className="text-sm text-[#333] whitespace-pre-line mt-1">{anotacao.conteudo}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ConsultationHistory;
