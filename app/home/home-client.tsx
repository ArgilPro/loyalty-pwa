'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdCarousel from './ad-carousel';
import QRModal from './qr-modal';
import type { MerchantAd, Transaction, Voucher } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface Props {
  profileName: string;
  voucher: Voucher | null;
  ads: MerchantAd[];
  transactions: Transaction[];
}

export default function HomeClient({ profileName, voucher, ads, transactions }: Props) {
  const [qrOpen, setQrOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#F4F4F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#E2DFD9] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6B6F75]">Welkom</p>
            <p className="text-sm font-semibold" style={{ color: '#1A1F24' }}>
              {profileName.split(' ')[0]}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-[#6B6F75] hover:text-slate-700"
          >
            Uitloggen
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-24">
        {/* Ad-carousel */}
        <AdCarousel ads={ads} />

        {/* Saldo-card */}
        {voucher ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2DFD9] p-6 mb-4 text-center">
            <p className="text-xs uppercase tracking-wide text-[#6B6F75]">Mijn punten</p>
            <p className="text-4xl font-bold mt-1" style={{ color: '#1A1F24' }}>
              {voucher.current_balance.toFixed(0)} punten
            </p>
            <p className="text-xs text-[#6B6F75] mt-1">
              = SRD {voucher.current_balance.toFixed(2)} bij een merchant
            </p>
            <p className="text-xs text-[#A39B8B] mt-3 font-mono">
              {voucher.voucher_number}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                {voucher.status.toUpperCase()}
              </span>
              {voucher.expires_at && (
                <span className="text-xs text-[#6B6F75]">
                  Verloopt {new Date(voucher.expires_at).toLocaleDateString('nl-NL')}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2DFD9] p-6 mb-4 text-center">
            <p className="text-sm text-[#6B6F75]">Geen actieve voucher gevonden.</p>
            <p className="text-xs text-[#A39B8B] mt-1">
              Je voucher verschijnt hier zodra de bank er een aanmaakt.
            </p>
          </div>
        )}

        {/* QR-knop */}
        <button
          onClick={() => setQrOpen(true)}
          disabled={!voucher || voucher.current_balance <= 0}
          className="w-full bg-[#1A1F24] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2C333A] disabled:opacity-50 disabled:cursor-not-allowed transition mb-4"
        >
          Toon QR aan merchant
        </button>

        {/* Transacties */}
        <div className="bg-white rounded-2xl border border-[#E2DFD9] overflow-hidden">
          <div className="p-4 border-b border-[#EEEDEA]">
            <h2 className="font-semibold text-sm" style={{ color: '#1A1F24' }}>
              Recente transacties
            </h2>
          </div>
          {transactions.length === 0 ? (
            <p className="p-6 text-sm text-[#6B6F75] text-center">
              Nog geen transacties.
            </p>
          ) : (
            <ul>
              {transactions.map((t) => (
                <li
                  key={t.id}
                  className="flex justify-between items-center px-4 py-3 border-b border-[#EEEDEA] last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1A1F24' }}>
                      {t.merchant_name ?? 'Trustbank Amanah'}
                    </p>
                    <p className="text-xs text-[#6B6F75]">
                      {new Date(t.created_at).toLocaleString('nl-NL')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">
                      -{t.amount.toFixed(0)} pt
                    </p>
                    <p className="text-xs text-[#A39B8B]">{t.reference.slice(0, 12)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* QR-modal */}
      <QRModal open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}