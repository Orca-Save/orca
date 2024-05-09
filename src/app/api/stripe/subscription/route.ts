'use server';

import db from '@/db/db';
import { createSubscription } from '@/lib/stripe';
import { NextResponse } from 'next/server';

async function POST(req: Request, res: Response) {
  createSubscription(await req.json());
}

export { POST };
