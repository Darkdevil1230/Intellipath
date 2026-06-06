import AuthMarketingPanel from './AuthMarketingPanel';

const AuthSplitLayout = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-[#0f172a] lg:flex-row">
    <AuthMarketingPanel />

    <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
            <span className="text-sm font-semibold text-white">IP</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">IntelliPath</span>
        </div>

        <div className="rounded-2xl border border-slate-200/10 bg-white p-7 shadow-2xl shadow-black/25 sm:p-8">
          {children}
        </div>
      </div>
    </main>
  </div>
);

export default AuthSplitLayout;
