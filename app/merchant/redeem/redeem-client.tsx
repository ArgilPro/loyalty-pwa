'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  sessionId: string;
  voucherNumber: string;
  balance: number;
  currency: string;
  customerName: string;
}

export default function RedeemClient({
  sessionId,
  voucherNumber,
  balance,
  currency,
  customerName,
}: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const isValid = parsedAmount > 0 && parsedAmount <= balance;

  async function handleConfirm() {
    if (!isValid) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/merchant/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, amount: parsedAmount }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: '#1A1F24' }}>
            Transactie geslaagd
          </h1>
          <p className="text-sm text-slate-600 mb-4">
            SRD {success.amount.toFixed(2)} is afgeschreven van de klant.
          </p>
          <div className="bg-slate-50 rounded-lg p-3 text-left text-xs space-y-1 mb-4">
            <p>
              <span className="text-slate-500">Referentie:</span>{' '}
              <span className="font-mono">{success.reference}</span>
            </p>
            <p>
              <span className="text-slate-500">Resterend saldo klant:</span>{' '}
              <span className="font-semibold">{success.new_balance.toFixed(0)} punten</span>
            </p>
          </div>
          <button
            onClick={() => router.push('/merchant')}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800"
          >
            Terug naar dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Terug
          </button>
          <p className="text-sm font-semibold" style={{ color: '#1A1F24' }}>
            Inwisselen
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 space-y-2">
          <p className="text-xs text-slate-500">Voucher</p>
          <p className="font-mono text-sm" style={{ color: '#1A1F24' }}>
            {voucherNumber}
          </p>
          <p className="text-xs text-slate-500 mt-3">Klant</p>
          <p className="text-sm font-medium" style={{ color: '#1A1F24' }}>
            {customerName}
          </p>
          <p className="text-xs text-slate-500 mt-3">Beschikbaar saldo</p>
          <p className="text-2xl font-bold" style={{ color: '#1A1F24' }}>
            {currency} {balance.toFixed(2)}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium mb-2" style={{ color: '#1A1F24' }}>
          Bedrag om in te wisselen
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-4 py-4 border border-slate-300 rounded-xl text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 mb-2"
        />
        {parsedAmount > balance && (
          <p className="text-sm text-red-600 mb-2">
            Onvoldoende saldo. Maximaal {currency} {balance.toFixed(2)}.
          </p>
        )}
        <p className="text-xs text-slate-500 mb-6">
          Resterend saldo klant: {Math.max(0, balance - parsedAmount).toFixed(0)} punten
        </p>

        <button
          onClick={handleConfirm}
          disabled={!isValid || loading}
          className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Bezig...' : `Bevestig ${currency} ${parsedAmount.toFixed(2)}`}
        </button>
      </main>
    </div>
  );
}