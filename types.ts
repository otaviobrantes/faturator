export interface Cliente {
  nome_titular: string;
  cpf_cnpj: string;
  endereco: string;
  numero_instalacao: string;
}

export interface Fatura {
  periodo_referencia: string;
  data_vencimento: string;
  numero_fatura: string;
  distribuidora: string;
}

export interface HistoricoItem {
  mes_ano: string;
  consumo_kwh: number;
}

export interface Consumo {
  total_kwh: number;
  consumo_ponta_kwh: number;
  consumo_fora_ponta_kwh: number;
  demanda_contratada_kw: number;
  demanda_medida_kw: number;
  historico_consumo: HistoricoItem[];
}

export interface Financeiro {
  valor_total: number;
  valor_energia_kwh: number;
  encargos_tributos: number;
  bandeira_tarifaria: string;
}

export interface Instalacao {
  tensao: string;
  subgrupo_tarifario: string;
  modalidade_tarifaria: string;
}

export interface ExtractedData {
  cliente: Cliente;
  fatura: Fatura;
  consumo: Consumo;
  financeiro: Financeiro;
  instalacao: Instalacao;
}

export interface AnalysisResult {
  data: ExtractedData;
  resumo_executivo: string;
}
