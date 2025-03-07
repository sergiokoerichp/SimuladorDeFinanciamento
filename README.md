# Simulador de Financiamento

## Descrição
O **Simulador de Financiamento** é uma aplicação web que permite calcular parcelas de financiamentos de capital de giro com diferentes tipos de cálculos e condições de pagamento. O projeto foi desenvolvido com foco em fornecer uma interface responsiva e amigável, e com gráficos interativos para análise de dados financeiros.

## Funcionalidades
- Cálculo de parcelas com diferentes modalidades:
  - Pré-fixado com juros sobre saldo devedor
  - Pré-fixado com juros na parcela
  - Pós-fixado com juros e correção no saldo devedor
  - Pós-fixado com juros e correção na parcela
  - Pós-fixado com juros no saldo devedor e correção na parcela
- Exportação de relatórios detalhados em CSV e PDF.
- Gráficos interativos para análise de juros, correção monetária e saldo devedor.
- Suporte a múltiplos idiomas (Português e Inglês).
- Interface responsiva otimizada para dispositivos móveis e desktop.

## Tecnologias Utilizadas

### Front-End
- **React.js**
- **Tailwind CSS**
- **Chart.js** (Gráficos interativos)
- **Axios** (Comunicação com API)
- **i18next** (Suporte a múltiplos idiomas)

### Back-End
- **Node.js**
- **Express.js**
- **CORS** (Gerenciamento de políticas de acesso entre origens)

### Outros
- **Heroku** (Hospedagem e deploy do aplicativo)
- **jsPDF** e **file-saver** (Geração de relatórios em PDF e CSV)

## Pré-requisitos
- **Node.js** (v16 ou superior)
- **npm** (Gerenciador de pacotes)

## Instalação

### Clonar o Repositório
```bash
git clone https://github.com/sergiokoerichp/simulador-financiamento.git
cd simulador-financiamento
```

### Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto e configure a URL da API:
```env
REACT_APP_API_URL=https://lab-sergio-816459c5c0a0.herokuapp.com/
```

### Instalar Dependências
```bash
npm install
```

### Executar o Projeto Localmente
#### Back-End:
```bash
node server.js
```
#### Front-End:
```bash
npm start
```

## Deploy no Heroku
O aplicativo está hospedado no Heroku e pode ser acessado pelo link:
https://lab-sergio-816459c5c0a0.herokuapp.com/

### Atualização do Projeto no Heroku
1. Faça alterações no código.
2. Adicione ao controle de versão:
   ```bash
   git add .
   git commit -m "Atualizações no projeto"
   ```
3. Envie para o Heroku:
   ```bash
   git push heroku main
   ```

## Estrutura do Projeto

```
simulador-financiamento/
├── public/                # Arquivos públicos (favicon, index.html, etc.)
├── src/                   # Código-fonte do front-end
│   ├── components/        # Componentes React
│   ├── i18n/              # Configuração de internacionalização
│   └── App.js             # Componente principal
├── server.js              # Servidor Node.js
├── package.json           # Configurações do projeto
└── .env                   # Variáveis de ambiente (não enviado ao repositório)
```

## Contribuição
Contribuições são bem-vindas! Siga os passos abaixo para colaborar:
1. Faça um fork do repositório.
2. Crie um branch para a funcionalidade:
   ```bash
   git checkout -b minha-funcionalidade
   ```
3. Faça as alterações e envie um pull request.

## Licença
Este projeto está licenciado sob a [MIT License](LICENSE).

---

**Desenvolvido com dedicação!**
