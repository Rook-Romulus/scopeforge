import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <Link href="/dashboard" className="text-lg font-bold text-white">⚙️ ScopeForge</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: "/dashboard", label: "Dashboard", icon: "🏠" },
            { href: "/dashboard/proposals", label: "Proposals", icon: "📄" },
            { href: "/dashboard/proposals/new", label: "New Proposal", icon: "➕" },
            { href: "/dashboard/brand", label: "Brand", icon: "🎨" },
            { href: "/dashboard/billing", label: "Billing", icon: "💳" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-600 mb-2">{session.user.email}</div>
          <Link href="/api/auth/signout" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Sign out</Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
