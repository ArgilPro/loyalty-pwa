import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ScanClient from './scan-client';

export default async function ScanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/merchant-login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'merchant') redirect('/login');

  return <ScanClient />;
}