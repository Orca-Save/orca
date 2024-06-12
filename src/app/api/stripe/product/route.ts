import { getPrice } from '@/app/(customerFacing)/user/_actions/stripe';
import authOptions from '@/lib/nextAuthOptions';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

async function stripeProductHandler(req: any) {
  try {
    const res = {
      getHeader: (name: string) => undefined,
      setHeader: (name: string, value: string) => {},
      status: (code: number) => ({
        json: (data: any) => NextResponse.json(data, { status: code }),
      }),
    };
    // @ts-ignore
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }
    return NextResponse.json(await getPrice());
  } catch (e) {
    return NextResponse.json({ message: 'error' }, { status: 500 });
  }
}

export { stripeProductHandler as GET };
