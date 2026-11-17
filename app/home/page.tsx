import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import HomeClient from './home-client';
import type { MerchantAd, Transaction, Voucher } from '@/lib/types';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Profiel
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, account_number')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Voucher
  const { data: voucherData } = await supabase
    .from('vouchers')
    .select('id, voucher_number, current_balance, initial_amount, currency, status, expires_at')
    .eq('customer_id', profile.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const voucher: Voucher | null = voucherData
    ? {
        ...voucherData,
        current_balance: Number(voucherData.current_balance),
        initial_amount: Number(voucherData.initial_amount),
      }
    : null;

  // Ads
  const { data: adsData } = await supabase.rpc('get_active_merchant_ads');
  const ads: MerchantAd[] = (adsData ?? []).map((a: any) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    image_url: a.image_url,
    cta_text: a.cta_text,
    merchant_name: a.merchant_name,
  }));

  // Transacties (laatste 10)
  const { data: txnData } = await supabase
    .from('transactions')
    .select('id, amount, currency, reference, status, created_at, merchant_id')
    .eq('customer_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Merchant-namen ophalen voor transacties
  const merchantIds = [
    ...new Set((txnData ?? []).map((t) => t.merchant_id).filter(Boolean)),
  ];

  let merchantMap: Record<string, string> = {};
  if (merchantIds.length > 0) {
    const { data: merchants } = await supabase
      .from('merchants')
      .select('id, business_name')
      .in('id', merchantIds);

    merchantMap = Object.fromEntries(
      (merchants ?? []).map((m) => [m.id, m.business_name])
    );
  }

  const transactions: Transaction[] = (txnData ?? []).map((t) => ({
    id: t.id,
    amount: Number(t.amount),
    currency: t.currency,
    reference: t.reference,
    status: t.status,
    created_at: t.created_at,
    merchant_name: t.merchant_id ? merchantMap[t.merchant_id] ?? null : null,
  }));

  return (
    <HomeClient
      profileName={profile.full_name ?? 'Klant'}
      voucher={voucher}
      ads={ads}
      transactions={transactions}
    />
  );
}