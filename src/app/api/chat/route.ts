import { GoogleGenAI } from '@google/genai';
import { getMondayData } from '@/lib/monday/client';
import { calculateDealsAnalytics } from '@/lib/analytics/deals';
import { calculateWorkOrdersAnalytics } from '@/lib/analytics/workOrders';
import { calculateCrossBoardAnalytics } from '@/lib/analytics/crossBoard';
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
    const crossMetrics = calculateCrossBoardAnalytics(data.deals, data.workOrders);

    // 3. Assemble System Prompt Context
    const systemPrompt = `
      You are the Skylark Intelligence BI Agent.
      You help founders and executives understand their business using Monday.com data.
      
      RULES:
      - Direct answer first.
      - Never invent or calculate numbers yourself. Only use the metrics provided below.
      - If the user asks a question not covered by the data, state that gracefully.
      - If the question is ambiguous (e.g. "What is our revenue?"), ask clarifying questions ("Do you mean pipeline value, billed value, or collected amount?").
      - When summarizing, mention data quality caveats (e.g., if there are invalid records).
      - Provide useful insights and cross-board correlations where possible.
      
      CURRENT LIVE METRICS (Deterministically Calculated):
      
      DEALS:
      - Total Deals: ${dealsMetrics.totalDeals}
      - Open Deals: ${dealsMetrics.openDeals}
      - Closed Won Deals: ${dealsMetrics.closedWonDeals}
      - Pipeline Value: ${dealsMetrics.pipelineValue.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}
      - Weighted Pipeline: ${dealsMetrics.weightedPipeline.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}
      - Pipeline By Sector: ${JSON.stringify(dealsMetrics.pipelineBySector)}
      - Pipeline By Stage: ${JSON.stringify(dealsMetrics.pipelineByStage)}
      - Data Quality: ${dealsMetrics.dataQuality.invalidValueCount} deals had missing/invalid deal values.
      
      WORK ORDERS:
      - Total Work Orders: ${woMetrics.totalWorkOrders}
      - Completed: ${woMetrics.completedWorkOrders}
      - Active: ${woMetrics.activeWorkOrders}
      - Total Billed Value: ${woMetrics.billedValue.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}
      - Total Collected Value: ${woMetrics.collectedValue.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}
      - Outstanding Receivables: ${woMetrics.receivables.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}
      - Sector Distribution: ${JSON.stringify(woMetrics.sectorDist)}
      - Execution Status Dist: ${JSON.stringify(woMetrics.executionStatusDist)}
      - Data Quality: Invalid/missing fields -> Billed: ${woMetrics.dataQuality.invalidBilledValueCount}, Collected: ${woMetrics.dataQuality.invalidCollectedValueCount}, Receivables: ${woMetrics.dataQuality.invalidReceivablesCount}
      
      CROSS-BOARD METRICS (Sector Comparison):
      ${JSON.stringify(crossMetrics.sectorComparison)}
      
      If the user asks for a "Leadership Update", provide an executive summary covering Pipeline, Operational Highlights, Billed vs Collected, Receivables, Strong/Weak Sectors, and Risks based on the metrics above.
    `;

    // 4. Generate AI Response
    // Format messages for @google/genai
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
