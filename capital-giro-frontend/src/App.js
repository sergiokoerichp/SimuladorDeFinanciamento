import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';
import './i18n';

ChartJS.register(BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const App = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    valorEmprestimo: '',
    taxaJuros: '',
    numeroParcelas: '',
    mesInicio: '',
    anoInicio: '',
    tipoCalculo: 'a',
    taxaCorrecao: '',
  });
  const [parcelas, setParcelas] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validarCampos = () => {
    if (!formData.valorEmprestimo || formData.valorEmprestimo <= 0) {
      return t('amountError');
    }
    if (!formData.taxaJuros || formData.taxaJuros <= 0) {
      return t('interestRateError');
    }
    if (!formData.numeroParcelas || formData.numeroParcelas <= 0) {
      return t('installmentsError');
    }
    if (!formData.mesInicio || formData.mesInicio < 1 || formData.mesInicio > 12) {
      return t('startMonthError');
    }
    if (!formData.anoInicio || formData.anoInicio <= 0) {
      return t('startYearError');
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mensagemErro = validarCampos();
    if (mensagemErro) {
      setErro(mensagemErro);
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      const response = await axios.post('http://localhost:5000/api/calcular', formData);
      setParcelas(response.data.parcelas);
    } catch (error) {
      console.error('Erro ao calcular parcelas:', error);
      setErro(t('calculationError'));
    } finally {
      setCarregando(false);
    }
  };

  const exportarCSV = () => {
    const linhas = parcelas.map((parcela) => (
      `${parcela.parcela},${new Date(parcela.data).toLocaleDateString()},${parcela.principal},${parcela.juros},${parcela.correcao},${parcela.total}`
    ));
    const csvContent = ['Parcela,Data,Principal,Juros,Correção,Total', ...linhas].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'parcelas.csv');
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text(t('results'), 10, 10);
    doc.autoTable({
      head: [['Parcela', t('date'), t('principal'), t('interestRate'), t('correction'), t('balance'), t('total')]],
      body: parcelas.map((parcela, index) => [
        parcela.parcela,
        new Date(parcela.data).toLocaleDateString(),
        parcela.principal,
        parcela.juros,
        parcela.correcao,
        index === 0 ? formData.valorEmprestimo : parcelas[index - 1].saldoDevedor - parcela.principal,
        parcela.total,
      ]),
    });
    doc.save('relatorio-detalhado.pdf');
  };

  const chartDataJuros = {
    labels: parcelas.map((parcela) => `Parcela ${parcela.parcela}`),
    datasets: [
      {
        label: t('interestChartLabel'),
        data: parcelas.map((parcela) => parseFloat(parcela.juros)),
        backgroundColor: '#3B82F6',
      },
      {
        label: t('correctionChartLabel'),
        data: parcelas.map((parcela) => parseFloat(parcela.correcao)),
        backgroundColor: '#F97316',
      },
    ],
  };

  const chartDataSaldoDevedor = {
    labels: parcelas.map((parcela) => `Parcela ${parcela.parcela}`),
    datasets: [
      {
        label: t('balanceChartLabel'),
        data: parcelas.reduce((acc, parcela, index) => {
          const saldo = index === 0
            ? formData.valorEmprestimo - parcela.principal
            : acc[index - 1] - parcela.principal;
          acc.push(saldo);
          return acc;
        }, []),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => i18n.changeLanguage('en')}
          className={`px-4 py-2 rounded transition-colors duration-300 ${
            i18n.language === 'en' ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-700'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => i18n.changeLanguage('pt')}
          className={`px-4 py-2 rounded transition-colors duration-300 ${
            i18n.language === 'pt' ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-700'
          }`}
        >
          PT
        </button>
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-orange-600">{t('title')}</h1>
        {erro && <p className="text-red-500 mb-4 text-center">{erro}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              name="valorEmprestimo"
              placeholder={t('amount')}
              value={formData.valorEmprestimo}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded w-full focus:outline-orange-400"
              required
            />
            <input
              type="number"
              name="taxaJuros"
              placeholder={t('interestRate')}
              value={formData.taxaJuros}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded w-full focus:outline-orange-400"
              required
            />
            <input
              type="number"
              name="numeroParcelas"
              placeholder={t('installments')}
              value={formData.numeroParcelas}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded w-full focus:outline-orange-400"
              required
            />
            <input
              type="number"
              name="mesInicio"
              placeholder={t('startMonth')}
              value={formData.mesInicio}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded w-full focus:outline-orange-400"
              required
            />
            <input
              type="number"
              name="anoInicio"
              placeholder={t('startYear')}
              value={formData.anoInicio}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded w-full focus:outline-orange-400"
              required
            />
            <input
              type="number"
              name="taxaCorrecao"
              placeholder={t('correctionRate')}
              value={formData.taxaCorrecao}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded w-full focus:outline-orange-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">{t('calculationType')}</label>
            <select
              name="tipoCalculo"
              value={formData.tipoCalculo}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded w-full"
            >
              <option value="a">{t('typeA')}</option>
              <option value="b">{t('typeB')}</option>
              <option value="c">{t('typeC')}</option>
              <option value="d">{t('typeD')}</option>
              <option value="e">{t('typeE')}</option>

            </select>
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded ${carregando ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-700'}`}
            disabled={carregando}
          >
            {carregando ? t('calculating') : t('calculate')}
          </button>
        </form>

        {parcelas.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4 text-orange-600">{t('results')}</h2>
            <div className="flex gap-4 mb-4 flex-wrap">
              <button
                onClick={exportarCSV}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                {t('downloadCSV')}
              </button>
              <button
                onClick={exportarPDF}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                {t('downloadPDF')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm md:text-base">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 border border-gray-300">{t('installment')}</th>
                    <th className="p-2 border border-gray-300">{t('date')}</th>
                    <th className="p-2 border border-gray-300">{t('principal')}</th>
                    <th className="p-2 border border-gray-300">{t('interestRate')}</th>
                    <th className="p-2 border border-gray-300">{t('correction')}</th>
                    <th className="p-2 border border-gray-300">{t('total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {parcelas.map((parcela) => (
                    <tr key={parcela.parcela}>
                      <td className="p-2 border border-gray-300 text-center">{parcela.parcela}</td>
                      <td className="p-2 border border-gray-300 text-center">{new Date(parcela.data).toLocaleDateString()}</td>
                      <td className="p-2 border border-gray-300 text-right">R$ {parcela.principal}</td>
                      <td className="p-2 border border-gray-300 text-right">R$ {parcela.juros}</td>
                      <td className="p-2 border border-gray-300 text-right">R$ {parcela.correcao}</td>
                      <td className="p-2 border border-gray-300 text-right">R$ {parcela.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4 text-orange-600">{t('charts')}</h2>
              <div className="flex flex-col gap-4 items-center">
                <div className="w-full md:w-3/4 max-w-lg">
                  <Bar
                    data={chartDataJuros}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                    }}
                    height={300}
                  />
                </div>
                <div className="w-full md:w-3/4 max-w-lg">
                  <Line
                    data={chartDataSaldoDevedor}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                    }}
                    height={300}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
