import {
  Crown,
  LayoutDashboard,
  Menu,
  Package,
  ShoppingCart,
  X,
} from "lucide-react";
import { useState } from "react";
import Dashboard from "./Dashboard";
import PointOfSale from "./PointOfSale";
import StockManagement from "./StockManagement";

const GOLD = "#D4A017";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "pos", label: "Point of Sale", icon: ShoppingCart },
  { key: "stock", label: "Stock Management", icon: Package },
];

function SidebarContent({ page, setPage, onNavigate }) {
  return (
    <>
      <div className="px-6 py-7 flex flex-col items-center border-b border-white/10">
        <Crown size={28} style={{ color: GOLD }} />
        <div className="mt-2 font-bold tracking-widest text-base" style={{ color: GOLD }}>
          QUEENS
        </div>
        <div className="text-[10px] tracking-[0.2em] text-gray-400 mt-0.5">
          GUEST HOUSE
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {TABS.map((tab) => {
          const active = page === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setPage(tab.key);
                onNavigate?.();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              style={active ? { backgroundColor: GOLD } : {}}
            >
              <tab.icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mx-3 mb-4 rounded-lg bg-white/5 flex items-center gap-2">
        <Crown size={16} style={{ color: GOLD }} />
        <div className="text-xs text-gray-300">
          Welcome,
          <div className="font-semibold text-white">Administrator</div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentTab = TABS.find((t) => t.key === page);
  
  return (
    <div className="h-screen bg-gray-50 font-sans flex overflow-hidden">
      {/* Desktop sidebar - always visible on lg+, full height, fixed in place */}
      <aside className="hidden lg:flex lg:flex-col w-60 h-screen bg-[#0d0d0d] flex-shrink-0 overflow-y-auto">
        <SidebarContent page={page} setPage={setPage} />
      </aside>

      {/* Mobile sidebar - slide-in overlay */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileNavOpen(false)}
          />
          {/* drawer */}
          <aside className="relative w-64 h-screen bg-[#0d0d0d] flex flex-col z-50 transition-transform duration-200 overflow-y-auto">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent
              page={page}
              setPage={setPage}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top bar - fixed t top, shows hamburger only on mobile/tablet */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center gap-3 lg:hidden flex-shrink-0">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Crown size={18} style={{ color: GOLD }} />
            <span className="font-bold text-gray-900 text-sm">
              {currentTab?.label ?? "Queens Guest House"}
            </span>
          </div>
        </header>

        {/* Scrollable content - only this area scrolls */}
        <main className="flex-1 overflow-y-auto">
          {page === "dashboard" && <Dashboard />}
          {page === "pos" && <PointOfSale />}
          {page === "stock" && <StockManagement />}
        </main>
      </div>
    </div>
  );
}
