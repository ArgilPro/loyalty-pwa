'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ScanClient() {
  const router = useRouter();
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<any>(null);
  const scannerContainerId = 'qr-reader';

  async function handleToken(token: string) {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/merchant/validate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Stop camera
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {}
      }

      // Navigeer naar redeem met session info
      const params = new URLSearchParams({
        sessionId: data.session_id,
        voucherNumber: data.voucher_number,
        balance: String(data.balance),
        currency: data.currency,
        customerName: data.customer_name ?? 'Klant',
      });
      router.push(`/merchant/redeem?${params.toString()}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function startCamera() {
    setError(null);
    setCameraActive(true);

    // Dynamisch importeren om SSR-problemen te voorkomen
    const { Html5Qrcode } = await import('html5-qrcode');

    try {
      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleToken(decodedText);
        },
        () => {
          // Stille fout — genegeerd
        }
      );
    } catch (err: any) {
      setError(
        'Camera kon niet worden gestart. Controleer toestemmingen of voer de code handmatig in.'
      );
      setCameraActive(false);
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
        } catch {}
      }
    };
  }, []);

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
            Scan klant-QR
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {!cameraActive && (
          <button
            onClick={startCamera}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 mb-4"
          >
            Camera starten
          </button>
        )}

        {cameraActive && (
          <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 bg-black">
            <div id={scannerContainerId} className="w-full" />
          </div>
        )}

        {loading && (
          <p className="text-center text-sm text-slate-500 mb-4">Valideren...</p>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-medium mb-2" style={{ color: '#1A1F24' }}>
            Of voer de QR-code handmatig in
          </p>
          <p className="text-xs text-slate-500 mb-3">
            Handig als de camera niet werkt of in een testomgeving.
          </p>
          <textarea
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value.trim())}
            placeholder="Plak hier de token van de klant"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 mb-3"
          />
          <button
            onClick={() => handleToken(manualToken)}
            disabled={loading || !manualToken.trim()}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Bezig...' : 'Token valideren'}
          </button>
        </div>
      </main>
    </div>
  );
}