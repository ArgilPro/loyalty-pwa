'use client';

import Link from 'next/link';
import LogoutButton from './logout-button';


interface Transaction {
  id: string;
  amount: number;
  currency: string;
  reference: string;
  created_at: string;
  customer_ref: string;
}

interface PendingRequest {
  id: string;
  amount: number;
  status: string;
  submitted_at: string;
}

interface Props {
  businessName: string;
  balance: number;
  transactions: Transaction[];
  pendingRequests: PendingRequest[];
}

export default function DashboardClient({
  businessName,
  balance,
  transactions,
  pendingRequests,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Merchant</p>
            <p className="text-sm font-semibold" style={{ color: '#1A1F24' }}>
              {businessName}
            </p>
          </div>
          <Link href="/merchant/logout" className="hidden" />
          <LogoutButton />

        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-24">
        {/* Saldo */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Beschikbaar saldo
          </p>
          <p className="text-4xl font-bold mt-1" style={{ color: '#1A1F24' }}>
            SRD {balance.toFixed(2)}
          </p>
          {pendingRequests.length > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              {pendingRequests.length} uitbetaalverzoek(en) in behandeling
            </p>
          )}
        </div>

        {/* Acties */}
        <Link
          href="/merchant/scan"
          className="block w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold text-center hover:bg-slate-800 transition mb-3"
        >
          Scan klant-QR
        </Link>
        <Link
          href="/merchant/redemption-request"
          className="block w-full bg-white border border-slate-300 text-slate-700 py-3.5 rounded-xl font-semibold text-center hover:bg-slate-50 transition mb-4"
        >
          Uitbetaling aanvragen
        </Link>

        {/* Recente transacties */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-sm" style={{ color: '#1A1F24' }}>
              Recente transacties
            </h2>
            <Link
              href="/merchant/transactions"
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Alles bekijken →
            </Link>
          </div>
          {transactions.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 text-center">
              Nog geen transacties. Scan een klant-QR om te beginnen.
            </p>
          ) : (
            <ul>
              {transactions.map((t) => (
                <li
                  key={t.id}
                  className="flex justify-between items-center px-4 py-3 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1A1F24' }}>
                      Customer #{t.customer_ref}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(t.created_at).toLocaleString('nl-NL')}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-600">
                    +SRD {t.amount.toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}