import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { 
  User, 
  MapPin, 
  Zap, 
  FileText, 
  TrendingUp, 
  CreditCard, 
  Activity, 
  Calendar,
  Code,
  Trophy
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface DashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ 
  title, 
  icon, 
  children,
  className = ""
}) => (
  <div className={`bg-white rounded-xl shadow-lg border-b-4 border-red-500 p-6 ${className}`}>
    <div className="flex items-center gap-2 mb-4 text-slate-900 border-b border-yellow-200 pb-2">
      <div className="p-2 bg-yellow-400 text-red-700 rounded-lg shadow-sm border border-yellow-500">
        {icon}
      </div>
      <h3 className="font-bold text-lg uppercase tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const Field: React.FC<{ label: string; value: string | number; subValue?: string }> = ({ label, value, subValue }) => (
  <div className="mb-3 last:mb-0">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
    <p className="text-base font-bold text-slate-900 truncate" title={String(value)}>
      {value}
    </p>
    {subValue && <p className="text-xs text-slate-500 font-medium">{subValue}</p>}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ result, onReset }) => {
  const { data, resumo_executivo } = result;
  const [showJson, setShowJson] = useState(false);

  // Format currency
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Format number
  const formatNumber = (val: number) => 
    new Intl.NumberFormat('pt-BR').format(val);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-orange-200 to-red-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8 bg-white/50 p-4 rounded-xl border border-white backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg text-yellow-300 transform -rotate-3">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase italic">Placar da Análise</h1>
              <p className="text-slate-700 font-medium text-sm">Gemini 2.5 Flash entrou em campo</p>
            </div>
          </div>
          <button 
            onClick={onReset}
            className="px-6 py-3 text-sm font-bold text-white bg-red-600 border-b-4 border-red-800 rounded-lg hover:bg-red-500 hover:border-red-700 transition-all active:border-b-0 active:translate-y-1 shadow-lg uppercase tracking-wider"
          >
            Nova Rodada
          </button>
        </div>

        {/* Executive Summary */}
        <div className="mb-8 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl border-4 border-yellow-400 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 bg-yellow-400 opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-yellow-400 rounded-lg border-2 border-yellow-600 shadow-md">
              <Activity className="w-6 h-6 text-red-700" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black uppercase mb-3 text-yellow-300 drop-shadow-md tracking-wider">Resenha do Técnico</h2>
              <div className="bg-red-800/50 p-4 rounded-lg border border-red-500/30">
                <p className="text-white font-medium leading-relaxed whitespace-pre-wrap">{resumo_executivo}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Client Info */}
          <Card title="O Capitão (Cliente)" icon={<User className="w-5 h-5" />}>
            <Field label="Titular" value={data.cliente.nome_titular} />
            <Field label="CPF/CNPJ" value={data.cliente.cpf_cnpj} />
            <Field label="Nº Instalação" value={data.cliente.numero_instalacao} />
            <div className="mt-2 pt-2 border-t border-slate-100">
               <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <p className="text-sm font-medium text-slate-700">{data.cliente.endereco}</p>
               </div>
            </div>
          </Card>

          {/* Invoice Info */}
          <Card title="Súmula (Fatura)" icon={<FileText className="w-5 h-5" />}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Mês Ref." value={data.fatura.periodo_referencia} />
              <Field label="Vencimento" value={data.fatura.data_vencimento} />
            </div>
            <div className="mt-3">
              <Field label="Nº da Fatura" value={data.fatura.numero_fatura} />
              <Field label="Distribuidora" value={data.fatura.distribuidora} />
            </div>
          </Card>

          {/* Financials */}
          <Card title="A Dolorosa (Financeiro)" icon={<CreditCard className="w-5 h-5" />}>
            <div className="mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
               <p className="text-xs font-bold text-red-500 uppercase">Valor Total</p>
               <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(data.financeiro.valor_total)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Energia (R$/kWh)</span>
                <span className="font-bold">{formatCurrency(data.financeiro.valor_energia_kwh)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Encargos/Trib.</span>
                <span className="font-bold">{formatCurrency(data.financeiro.encargos_tributos)}</span>
              </div>
              <div className="flex justify-between text-sm items-center pt-2 border-t border-slate-100 mt-2">
                <span className="text-slate-600 font-medium">Bandeira</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                  data.financeiro.bandeira_tarifaria.toLowerCase().includes('verde') ? 'bg-green-100 text-green-700 border-green-200' :
                  data.financeiro.bandeira_tarifaria.toLowerCase().includes('amarela') ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                  'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {data.financeiro.bandeira_tarifaria}
                </span>
              </div>
            </div>
          </Card>

          {/* Consumption Details */}
          <Card title="Estatísticas (Consumo)" icon={<Zap className="w-5 h-5" />}>
             <div className="grid grid-cols-2 gap-4 mb-4">
                <Field label="Total (kWh)" value={formatNumber(data.consumo.total_kwh)} />
                <Field label="Demanda Contratada" value={`${data.consumo.demanda_contratada_kw} kW`} />
             </div>
             <div className="space-y-2 pt-2 border-t border-slate-100">
               <div className="flex justify-between text-sm">
                 <span className="text-slate-600 font-medium">Consumo Ponta</span>
                 <span className="font-bold">{formatNumber(data.consumo.consumo_ponta_kwh)} kWh</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-600 font-medium">Fora Ponta</span>
                 <span className="font-bold">{formatNumber(data.consumo.consumo_fora_ponta_kwh)} kWh</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-600 font-medium">Demanda Medida</span>
                 <span className="font-bold">{formatNumber(data.consumo.demanda_medida_kw)} kW</span>
               </div>
             </div>
          </Card>

          {/* Installation Specs */}
          <Card title="O Estádio (Instalação)" icon={<TrendingUp className="w-5 h-5" />}>
             <Field label="Subgrupo Tarifário" value={data.instalacao.subgrupo_tarifario} />
             <Field label="Modalidade" value={data.instalacao.modalidade_tarifaria} />
             <Field label="Tensão" value={data.instalacao.tensao} />
          </Card>

        </div>

        {/* Charts Section */}
        <div className="bg-white rounded-xl shadow-lg border-b-4 border-red-500 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6 border-b border-yellow-200 pb-2">
            <div className="p-2 bg-yellow-400 text-red-700 rounded-lg shadow-sm border border-yellow-500">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg uppercase text-slate-900">Histórico de Consumo (12 meses)</h3>
          </div>
          
          <div className="h-[300px] w-full">
            {data.consumo.historico_consumo && data.consumo.historico_consumo.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data.consumo.historico_consumo}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis 
                      dataKey="mes_ano" 
                      tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} 
                      axisLine={false}
                      tickLine={false}
                   />
                   <YAxis 
                      tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value}`}
                   />
                   <Tooltip 
                      cursor={{fill: '#fef9c3'}}
                      contentStyle={{
                        borderRadius: '8px', 
                        border: '2px solid #ef4444', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontWeight: 'bold'
                      }}
                   />
                   <Bar dataKey="consumo_kwh" fill="#ef4444" radius={[4, 4, 0, 0]} name="Consumo (kWh)" />
                 </BarChart>
               </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                O histórico foi expulso do jogo (não encontrado).
              </div>
            )}
          </div>
        </div>

        {/* JSON Preview */}
        <div className="border-2 border-slate-900 rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <button 
            onClick={() => setShowJson(!showJson)}
            className="w-full px-6 py-4 flex items-center justify-between bg-slate-800 hover:bg-slate-700 transition-colors border-b border-slate-700"
          >
            <div className="flex items-center gap-2 text-yellow-400">
              <Code className="w-5 h-5" />
              <span className="font-bold font-mono">VAR (JSON Estruturado)</span>
            </div>
            <span className="text-xs font-bold text-slate-900 bg-yellow-400 px-2 py-1 rounded uppercase">
               {showJson ? 'Esconder VAR' : 'Chamar VAR'}
            </span>
          </button>
          
          {showJson && (
            <div className="p-6 bg-slate-950 overflow-x-auto border-t-2 border-yellow-600/30">
              <pre className="text-xs font-mono text-green-400 leading-relaxed">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;