import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function MerchantTransactions() {
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

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  const { data: txns } = await supabase
    .from('transactions')
    .select('id, amount, currency, reference, status, created_at, customer_id')
    .eq('merchant_id', merchant?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/merchant"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Terug
          </Link>
          <p className="text-sm font-semibold" style={{ color: '#1A1F24' }}>
            Alle transacties
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {!txns || txns.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 text-center bg-white rounded-2xl border border-slate-200">
            Nog geen transacties.
          </p>
        ) : (
          <ul className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {txns.map((t) => (
              <li
                key={t.id}
                className="flex justify-between items-center px-4 py-3 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1A1F24' }}>
                    Customer #{t.customer_id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(t.created_at).toLocaleString('nl-NL')}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">{t.reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    +SRD {Number(t.amount).toFixed(2)}
                  </p>
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                    {t.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}