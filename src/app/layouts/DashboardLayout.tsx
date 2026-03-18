import { Outlet } from "react-router";
import { useAuth } from "../providers/AuthProvider";

export function DashboardLayout() {
  const { role, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Bilgenly Dashboard
            </p>
            <h1 className="text-2xl font-semibold capitalize">
              {role ?? "User"} panel
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={signOut}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
