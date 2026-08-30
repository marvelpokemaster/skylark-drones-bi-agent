import { normalizeDeal, normalizeWorkOrder } from './normalize';
import { NormalizedDeal, NormalizedWorkOrder, MondayCache } from './types';

const MONDAY_API_URL = 'https://api.monday.com/v2';

async function fetchBoardItems(token: string, boardId: string): Promise<any[]> {
  const allItems: any[] = [];
  let cursor: string | null = null;

  while (true) {
    const query = cursor
      ? `
        query {
          next_items_page(cursor: "${cursor}", limit: 100) {
            cursor
            items {
              id
              name
              column_values {
                id
                text
              }
            }
          }
        }
      `
      : `
        query {
          boards(ids: ["${boardId}"]) {
            items_page(limit: 100) {
              cursor
              items {
                id
                name
                column_values {
                  id
                  text
                }
              }
            }
          }
        }
      `;

    // Using native fetch for Next.js caching (revalidates every 300 seconds)
    const res = await fetch(MONDAY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'API-Version': '2024-01'
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 300, tags: ['monday-data'] }
    });

    if (!res.ok) {
      throw new Error(`Monday API HTTP Error: ${res.status}`);
    }

    const data = await res.json();

    if (data.errors) {
      console.error('Monday API Error:', data.errors);
      throw new Error('Monday API returned errors.');
    }

    const resPage: any = cursor 
      ? data.data.next_items_page 
      : data.data.boards[0]?.items_page;

    if (!resPage) break;
    
    if (resPage.items && resPage.items.length > 0) {
      allItems.push(...resPage.items);
    }
    
    cursor = resPage.cursor;
    if (!cursor) break;
  }
  
  return allItems;
}

export async function getMondayData(): Promise<MondayCache> {
  const token = process.env.MONDAY_API_TOKEN;
  const dealsBoardId = process.env.MONDAY_DEALS_BOARD_ID;
  const woBoardId = process.env.MONDAY_WORK_ORDERS_BOARD_ID;

  if (!token || !dealsBoardId || !woBoardId) {
    throw new Error('Missing Monday.com environment variables.');
  }

  const [rawDeals, rawWorkOrders] = await Promise.all([
    fetchBoardItems(token, dealsBoardId),
    fetchBoardItems(token, woBoardId)
  ]);

  return {
    deals: rawDeals.map(normalizeDeal),
    workOrders: rawWorkOrders.map(normalizeWorkOrder),
    lastUpdated: new Date()
  };
}
