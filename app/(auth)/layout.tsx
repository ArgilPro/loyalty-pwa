export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: '#F4F4F2' }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold" style={{ color: '#1A1F24' }}>
              Trustbank Amanah
            </h1>
            <p className="text-sm mt-1" style={{ color: '#A39B8B' }}>
              Credit Rewards
            </p>
          </div>
          {children}
        </div>
      </div>
    );
  }