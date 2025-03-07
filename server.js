const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const XDate = require('xdate');

const app = express();
const PORTA = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
}));
app.use(bodyParser.json());

// Função para calcular juros compostos corretamente
const calcularJurosCompostos = (principal, taxaJuros, dias, N) => {
    const taxaDecimal = taxaJuros / 100;
    return principal * (Math.pow(1 + taxaDecimal , dias / N) - 1);
};

// Função para calcular parcelas considerando dias corridos
const calcularParcelas = (tipo, valorEmprestimo, taxaJurosAnual, numeroParcelas, mesInicio, anoInicio, taxaCorrecaoMensal) => {
    const parcelas = [];
    const principal = valorEmprestimo / numeroParcelas;
    const N_juros = 365; // Juros compostos considerando taxa anual para 365 dias
    const N_correcao = 30; // Correção monetária mensal para 30 dias

    let saldoDevedor = valorEmprestimo;
    let dataAnterior = new XDate(anoInicio, mesInicio - 1, 1); // O empréstimo é liberado no primeiro dia do mês
    let dataInicial = new XDate(anoInicio, mesInicio - 1, 1); // Data do primeiro evento

    for (let i = 0; i < numeroParcelas; i++) {
        let juros = 0;
        let correcao = 0;
        let parcelaTotal = 0;

        // Data do pagamento da parcela sempre no primeiro dia do mês seguinte
        const dataPagamento = new XDate(dataAnterior).addMonths(1);
        const diasDecorridos = Math.abs(dataPagamento.diffDays(dataAnterior)); // Calcula o número de dias corridos entre os eventos
        const diasDecorridosTotal = Math.abs(dataPagamento.diffDays(dataInicial)); // Calcula o número total de dias corridos desde o primeiro evento

        switch (tipo) {
            case "a": // Pré-fixado com juros sobre saldo devedor
                juros = calcularJurosCompostos(saldoDevedor, taxaJurosAnual, diasDecorridos, N_juros);
                parcelaTotal = principal + juros;
                break;

            case "b": // Pré-fixado com juros na parcela
                juros = calcularJurosCompostos(principal, taxaJurosAnual, diasDecorridosTotal, N_juros);
                parcelaTotal = principal + juros;
                break;

            case "c": // Pós-fixado com juros e correção no saldo devedor
                juros = calcularJurosCompostos(saldoDevedor, taxaJurosAnual, diasDecorridos, N_juros);
                correcao = calcularJurosCompostos(Number(saldoDevedor) + Number(juros), taxaCorrecaoMensal, diasDecorridos, N_correcao);
                parcelaTotal = principal + juros + correcao;
                break;

            case "d": // Pós-fixado com juros e correção na parcela
                juros = calcularJurosCompostos(principal, taxaJurosAnual, diasDecorridosTotal, N_juros);
                correcao = calcularJurosCompostos(principal + juros, taxaCorrecaoMensal, diasDecorridosTotal, N_correcao);
                parcelaTotal = principal + juros + correcao;
                break;

            case "e": // Pós-fixado com juros no saldo devedor e correção na parcela
                juros = calcularJurosCompostos(saldoDevedor, taxaJurosAnual, diasDecorridos, N_juros);
                correcao = calcularJurosCompostos(Number(principal)  + Number(juros), taxaCorrecaoMensal, diasDecorridosTotal, N_correcao);
                parcelaTotal = principal + juros + correcao;
                break;

            default:
                throw new Error("Tipo de cálculo não suportado");
        }

        parcelas.push({
            parcela: i + 1,
            data: dataPagamento.toString("yyyy-MM-dd"),
            principal: principal.toFixed(2),
            juros: juros.toFixed(2),
            correcao: correcao.toFixed(2),
            saldoDevedor: Number(saldoDevedor).toFixed(2),
            total: parcelaTotal.toFixed(2),
        });

        saldoDevedor -= principal;
        dataAnterior = new XDate(dataPagamento); // Atualiza a data anterior para a próxima parcela
    }

    return parcelas;
};

// Endpoint para calcular as parcelas
app.post('/api/calcular', (req, res) => {
    console.log("Requisição recebida:", req.body);
    
    const { valorEmprestimo, taxaJuros, numeroParcelas, mesInicio, anoInicio, tipoCalculo, taxaCorrecao } = req.body;

    try {
        const parcelas = calcularParcelas(tipoCalculo, valorEmprestimo, taxaJuros, numeroParcelas, mesInicio, anoInicio, taxaCorrecao);
        res.status(200).json({ parcelas });
    } catch (error) {
        console.error("Erro ao calcular as parcelas:", error);
        res.status(500).json({ error: "Erro ao calcular as parcelas" });
    }
});

// Configuração para servir o front-end
const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Iniciar o servidor
app.listen(PORTA, () => {
    console.log(Servidor rodando na porta ${PORTA});
});