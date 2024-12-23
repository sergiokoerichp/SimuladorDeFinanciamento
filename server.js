const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORTA = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Configuração de CORS
app.use(bodyParser.json());

// Função para calcular parcelas
const calcularParcelas = (tipo, valorEmprestimo, taxaJuros, numeroParcelas, mesInicio, anoInicio, taxaCorrecao) => {
    const parcelas = [];
    const principal = valorEmprestimo / numeroParcelas; // Amortização fixa
    const taxaAnual = taxaJuros / 100;
    const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1; // Converter para taxa mensal
    const correcaoMensal = taxaCorrecao / 100; // Correção monetária mensal

    let saldoDevedor = valorEmprestimo;
    let dataAtual = new Date(anoInicio, mesInicio, 1);

    for (let i = 0; i < numeroParcelas; i++) {
        let juros = 0;
        let correcao = 0;
        let parcelaTotal = 0;

        switch (tipo) {
            case "a": // Pré-fixado com juros sobre saldo devedor
                juros = saldoDevedor * taxaMensal;
                parcelaTotal = principal + juros;
                break;

            case "b": // Pré-fixado com juros na parcela
                juros = (valorEmprestimo * Math.pow(1 + taxaMensal, i + 1) - valorEmprestimo) / numeroParcelas;
                parcelaTotal = principal + juros;
                break;

            case "c": // Pós-fixado com juros e correção no saldo devedor
                juros = saldoDevedor * taxaMensal;
                correcao = saldoDevedor * correcaoMensal;
                parcelaTotal = principal + juros + correcao;
                break;

            case "d": // Pós-fixado com juros e correção na parcela
                juros = principal * taxaMensal;
                correcao = principal * correcaoMensal;
                parcelaTotal = principal + juros + correcao;
                break;

            case "e": // Pós-fixado com juros no saldo devedor e correção na parcela
                juros = saldoDevedor * taxaMensal;
                correcao = principal * correcaoMensal;
                parcelaTotal = principal + juros + correcao;
                break;

            default:
                throw new Error("Tipo de cálculo não suportado");
        }

        parcelas.push({
            parcela: i + 1,
            data: new Date(dataAtual.setMonth(dataAtual.getMonth() + 1)),
            principal: principal.toFixed(2),
            juros: juros.toFixed(2),
            correcao: (correcao || 0).toFixed(2),
            total: parcelaTotal.toFixed(2),
        });

        saldoDevedor -= principal;
    }

    return parcelas;
};

// Endpoint para calcular as parcelas
app.post('/api/calcular', (req, res) => {
    const { valorEmprestimo, taxaJuros, numeroParcelas, mesInicio, anoInicio, tipoCalculo, taxaCorrecao } = req.body;

    try {
        const parcelas = calcularParcelas(tipoCalculo, valorEmprestimo, taxaJuros, numeroParcelas, mesInicio - 1, anoInicio, taxaCorrecao);
        res.status(200).json({ parcelas });
    } catch (error) {
        console.error("Erro ao calcular as parcelas:", error);
        res.status(500).json({ error: "Erro ao calcular as parcelas" });
    }
});

const path = require('path');

// Servir arquivos estáticos do build do React
app.use(express.static(path.join(__dirname, 'capital-giro-frontend/build')));

// Rota fallback para o React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'capital-giro-frontend/build', 'index.html'));
});

// Iniciar o servidor
app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));