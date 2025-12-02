import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
Você é um especialista em análise de faturas de energia elétrica. Sua função é extrair e consolidar informações críticas de faturas de energia para facilitar a cotação no mercado livre de energia.

Leia todo o documento meticulosamente.
Identifique padrões e seções comuns em faturas de energia.
Extraia dados numéricos e textuais com precisão.

TRATAMENTO DE EXCEÇÕES:
Se algum dado não for encontrado, retorne "Não identificado" (para strings) ou 0 (para números).
Mantenha a formatação numérica padrão (decimal com ponto).
Valide dados críticos como CPF/CNPJ e números de instalação.

A resposta DEVE estar em formato JSON.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    data: {
      type: Type.OBJECT,
      properties: {
        cliente: {
          type: Type.OBJECT,
          properties: {
            nome_titular: { type: Type.STRING },
            cpf_cnpj: { type: Type.STRING },
            endereco: { type: Type.STRING },
            numero_instalacao: { type: Type.STRING },
          },
        },
        fatura: {
          type: Type.OBJECT,
          properties: {
            periodo_referencia: { type: Type.STRING },
            data_vencimento: { type: Type.STRING },
            numero_fatura: { type: Type.STRING },
            distribuidora: { type: Type.STRING },
          },
        },
        consumo: {
          type: Type.OBJECT,
          properties: {
            total_kwh: { type: Type.NUMBER },
            consumo_ponta_kwh: { type: Type.NUMBER },
            consumo_fora_ponta_kwh: { type: Type.NUMBER },
            demanda_contratada_kw: { type: Type.NUMBER },
            demanda_medida_kw: { type: Type.NUMBER },
            historico_consumo: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mes_ano: { type: Type.STRING, description: "Formato MM/AAAA ou similar" },
                  consumo_kwh: { type: Type.NUMBER },
                },
              },
            },
          },
        },
        financeiro: {
          type: Type.OBJECT,
          properties: {
            valor_total: { type: Type.NUMBER },
            valor_energia_kwh: { type: Type.NUMBER },
            encargos_tributos: { type: Type.NUMBER },
            bandeira_tarifaria: { type: Type.STRING },
          },
        },
        instalacao: {
          type: Type.OBJECT,
          properties: {
            tensao: { type: Type.STRING },
            subgrupo_tarifario: { type: Type.STRING },
            modalidade_tarifaria: { type: Type.STRING },
          },
        },
      },
    },
    resumo_executivo: {
      type: Type.STRING,
      description: "Resumo executivo em português destacando perfil de consumo, oportunidades de economia e dados relevantes para cotação.",
    },
  },
};

const fileToPart = async (file: File) => {
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      mimeType: file.type,
      data: base64Data,
    },
  };
};

export const analyzeBill = async (
  targetFile: File, 
  contextFile?: File | null, 
  customInstructions?: string
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = [];

  // 1. Add Context File (if provided) - "Few-shot" visual example
  if (contextFile) {
    const contextPart = await fileToPart(contextFile);
    parts.push(contextPart);
    parts.push({ text: "CONTEXTO / MODELO DE REFERÊNCIA: Use o documento acima como exemplo de como interpretar os dados ou como documentação auxiliar." });
  }

  // 2. Add Target File - The actual bill to analyze
  const targetPart = await fileToPart(targetFile);
  parts.push(targetPart);
  
  // 3. Construct the prompt
  let promptText = "Analise esta fatura de energia ALVO (a última imagem fornecida) e extraia os dados conforme o schema JSON.";
  
  if (customInstructions) {
    promptText += `\n\nINSTRUÇÕES ESPECÍFICAS DO USUÁRIO: ${customInstructions}`;
  }

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts,
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing bill:", error);
    throw error;
  }
};