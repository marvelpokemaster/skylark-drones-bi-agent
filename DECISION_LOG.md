# Decision Log - Skylark Intelligence

## 1. Problem Interpretation
Founders need reliable business intelligence from Monday.com boards containing messy, inconsistent data. The core challenge is bridging unstructured, potentially dirty real-world input with accurate executive reporting, while using an LLM conversationally.

## 2. Architecture Decision
**Decision:** Next.js App Router (Server-side API + Client UI).
**Why:** Enables secure server-side fetching of Monday GraphQL without exposing the token, native Next.js caching for performance, and seamless integration with the Vercel AI SDK.

## 3. Monday API over Hardcoded Files
**Decision:** All data is fetched live from `5030967513` and `5030967768` using cursor pagination (`items_page`). 
**Why:** A real BI tool must be dynamic. The problem stated not to hardcode the Excel files.

## 4. Deterministic Analytics + LLM Explanation
**Decision:** Extract all logic into `analytics/deals.ts` and `analytics/workOrders.ts`. Feed the aggregated JSON payload to the LLM system prompt.
**Why:** LLMs hallucinate math. By calculating pipeline values deterministically in TypeScript, the numbers are 100% accurate. The LLM acts purely as a linguistic router and narrator.

## 5. Data Normalization & Weighted Pipeline Assumptions
**Decision:**
- Extracted numeric digits from messy strings (e.g., `"5360 HA"` → `5360`).
- Mapped textual probabilities to floats: `High` = 0.8, `Medium` = 0.5, `Low` = 0.2.
- Weighted Pipeline = `Masked Deal value × Probability`.
**Why:** Necessary to synthesize analytics from unstructured textual columns.

## 6. Missing Data Handling
**Decision:** If a numerical field is missing or unparseable, it evaluates to `null`. It is excluded from sums, and the exclusion is tallied (`invalidBilledValueCount`, etc.).
**Why:** Falsely assuming `0` for missing data skews metrics. We inform the user explicitly of data quality caveats.

## 7. Leadership Update Interpretation
**Decision:** A dedicated button that automatically prompts the LLM to write an executive summary structured around Pipeline, Work-Order Operations, Receivables, and Risks.
**Why:** Saves the executive time over typing the prompt manually.

## 8. Trade-offs & Known Limitations
- **Trade-off:** Passing all aggregated context to the LLM works flawlessly for hundreds/thousands of records but would require a vector database or semantic chunking (RAG) if the Monday boards contained millions of records.
- **Limitation:** Cross-board correlation currently relies on matching exact Sector names.

## 9. Future Improvements
- Implement webhooks to invalidate the cache instantly when a Monday item changes, replacing the polling/manual refresh approach.
- Support deeper drill-downs (e.g. clicking a KPI card to see the underlying valid items).
