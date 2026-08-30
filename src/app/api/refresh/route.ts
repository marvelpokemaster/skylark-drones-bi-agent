import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST() {
  revalidatePath('/');
  return Response.json({ success: true, message: 'Cache invalidated.' });
}
