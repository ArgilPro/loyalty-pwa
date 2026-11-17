import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  // Zoek het actieve voucher van deze klant
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profiel niet gevonden' }, { status: 404 });
  }

  const { data: voucher, error: voucherError } = await supabase
    .from('vouchers')
    .select('id')
    .eq('customer_id', profile.id)
    .eq('status', 'active')
    .gt('current_balance', 0)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (voucherError || !voucher) {
    return NextResponse.json(
      { error: 'Geen actieve voucher met saldo gevonden' },
      { status: 404 }
    );
  }

  // Roep de RPC aan
  const { data, error } = await supabase.rpc('create_qr_session', {
    p_voucher_id: voucher.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}