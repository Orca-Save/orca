import { redirect } from 'next/navigation';

export default async function LogPage() {
  redirect('/log/saves');
}
