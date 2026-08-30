import { GoogleGenAI } from '@google/genai';
import { getMondayData } from '@/lib/monday/client';
import { calculateDealsAnalytics } from '@/lib/analytics/deals';
import { calculateWorkOrdersAnalytics } from '@/lib/analytics/workOrders';
import { buildSectorMatrix, calculateRiskOpportunitySignals } from '@/lib/analytics/sectorMatrix';
import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow 60 seconds

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({
        content: 'No AI API Key configured. Please set GOOGLE_GENERATIVE_AI_API_KEY to enable chat features.'
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

    // 1. Fetch Monday Data
    const data = await getMondayData();

    // 2. Compute Deterministic Analytics
    const dealsMetrics = calculateDealsAnalytics(data.deals);
    const woMetrics = calculateWorkOrdersAnalytics(data.workOrders);
    const sectorMatrix = buildSectorMatrix(data.deals, data.workOrders);
    const signals = calculateRiskOpportunitySignals(sectorMatrix);

    const currencyFmt = (val: number) => val.toLocaleString('en-IN', {style: 'currency', currency: 'INR', maximumFractionDigits: 0});

    // 3. Assemble System Prompt Context
    const systemPrompt = `
      You are the Skylark Intelligence BI Agent.
      You are an AI-native executive intelligence platform.
      
      RULES:
      - Direct answer first.
      - NEVER invent, interpolate, or calculate numbers yourself. Only use the metrics provided below.
      - If the question is ambiguous, ask clarifying questions.
      - DO NOT PRETEND sector is a unique record-level join key. If comparing across boards, explicitly state "Sector-level comparison".

      CRITICAL FEATURE - EVIDENCE BLOCK:
      For every meaningful numerical answer, YOU MUST provide a small compact "Evidence" block at the bottom of your response to prove you didn't hallucinate.
      Format it exactly like this:
      
      Evidence:
      • Pipeline: ₹XX Cr
      • Deals: 42
      Source: Deals / Work Orders · live Monday data
      Data Quality: [Mention any excluded invalid records if applicable]
      
      CRITICAL FEATURE - LEADERSHIP UPDATE 2.0:
      If the user asks for a "Leadership Update", generate a highly structured executive snapshot using EXACTLY this format:
      
      **EXECUTIVE SNAPSHOT**
      **Pipeline:** ${currencyFmt(dealsMetrics.pipelineValue)} | **Weighted:** ${currencyFmt(dealsMetrics.weightedPipeline)}
      **Operations:** ${woMetrics.activeWorkOrders} active work orders · ${Math.round((woMetrics.completedWorkOrders/woMetrics.totalWorkOrders)*100)}% completion
      **Financial:** ${currencyFmt(woMetrics.billedValue)} billed | ${currencyFmt(woMetrics.collectedValue)} collected | ${currencyFmt(woMetrics.receivables)} receivable
      
      **KEY INSIGHTS**
      1. [Insight 1 based on sectors]
      2. [Insight 2]
      3. [Insight 3]
      
      **RISKS**
      ${signals.risks.map(r => `⚠ ${r}`).join('\n')}
      
      **OPPORTUNITIES**
      ${signals.opportunities.map(r => `✓ ${r}`).join('\n')}
      
      **DATA QUALITY**
      ${dealsMetrics.dataQuality.invalidValueCount} deal records excluded due to missing values.
      
      *Based on live Monday data* (${new Date().toLocaleTimeString()})


      CURRENT LIVE METRICS (Deterministically Calculated):
      
      DEALS:
      - Total Deals: ${dealsMetrics.totalDeals} (Open: ${dealsMetrics.openDeals})
      - Pipeline Value: ${currencyFmt(dealsMetrics.pipelineValue)}
      - Weighted Pipeline: ${currencyFmt(dealsMetrics.weightedPipeline)}
      - Pipeline By Sector: ${JSON.stringify(dealsMetrics.pipelineBySector)}
      - Pipeline By Stage: ${JSON.stringify(dealsMetrics.pipelineByStage)}
      - Data Quality Excluded: ${dealsMetrics.dataQuality.invalidValueCount} deals
      
      WORK ORDERS:
      - Total Work Orders: ${woMetrics.totalWorkOrders} (Completed: ${woMetrics.completedWorkOrders})
      - Total Billed Value: ${currencyFmt(woMetrics.billedValue)}
      - Total Collected Value: ${currencyFmt(woMetrics.collectedValue)}
      - Outstanding Receivables: ${currencyFmt(woMetrics.receivables)}
      - Data Quality Missing -> Billed: ${woMetrics.dataQuality.invalidBilledValueCount}, Collected: ${woMetrics.dataQuality.invalidCollectedValueCount}, Receivables: ${woMetrics.dataQuality.invalidReceivablesCount}
      
      SECTOR PERFORMANCE MATRIX (Cross-Board):
      ${JSON.stringify(sectorMatrix.map(s => ({
        Sector: s.sectorName,
        Pipeline: currencyFmt(s.pipeline),
        Weighted: currencyFmt(s.weightedPipeline),
        Deals: s.dealCount,
        WOs: s.workOrderCount,
        Completion: Math.round(s.completionRate) + '%',
        Billed: currencyFmt(s.billed),
        Collected: currencyFmt(s.collected),
        Receivables: currencyFmt(s.receivable)
      })))}
      
      AUTOMATED SIGNALS:
      Risks: ${JSON.stringify(signals.risks)}
      Opportunities: ${JSON.stringify(signals.opportunities)}
    `;

    // 4. Generate AI Response
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedMessages,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return NextResponse.json({
      content: response.text
    });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
