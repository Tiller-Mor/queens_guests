import {
  AlertTriangle,
  BedDouble,
  DollarSign,
  Package,
  Users2,
} from "lucide-react";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "./store";

const GOLD = "#D4A017";
const GOLD_DARK = "#B8860B";
const LOW_STOCK_THRESHOLD = 5;

function StatCard({ icon: Icon, label, value, sub, subColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm borderborder-gray-100 p-5 flex items-center gap-4 flex-1 min-w-[200px]">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: GOLD }}
      >
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <div className="text-xs font-semibold text-gray-500 tracking-wide">
          {label}
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-0.5">{value}</div>
        {sub && (
          <div className={`text-xs font-medium mt-0.5 ${subColor}`}>{sub}</div>
        )}
      </div>
    </div>
  );
}

function isSameDay(isoDate, ref) {
  const d = new Date(isoDate);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export default function Dashboard() {
  const { items, transactions } = useStore();

  const today = new Date();

  // ---- Today's sales ----
  const todaysSales = useMemo(() => {
    return transactions
      .filter((t) => isSameDay(t.date, today))
      .reduce((sum, t) => sum + t.total, 0);
  }, [transactions]);

  // ---- Rooms available / occupied ----
  const roomItems = items.filter((it) => it.category === "Rooms");
  const totalRooms = roomItems.length;
  const availableRooms = roomItems.filter((it) => it.qty > 0).length;
  const occupiedRooms = totalRooms - availableRooms;
  const occupiedPct = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // ---- Low stock(non-room items only) ----
  const lowStockItems = items.filter(
    (it) => it.category !== "Rooms" && it.qty <= LOW_STOCK_THRESHOLD
  );

  // ---- Stock summary by category ----
  const categories = ["Refreshments", "Food", "Rooms"];
  const stockSummary = categories.map((cat) => ({
    label: cat,
    count: items.filter((it) => it.category === cat).length,
    color: cat === "Refreshments" ? "#3B82F6" : cat === "Food" ? "#10B981" : "#8B5CF6",
  }));

  // ---- Last 7 days sales chart ----
  const salesData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayTotal = transactions
        .filter((t) => isSameDay(t.date, d))
        .reduce((sum, t) => sum + t.total, 0);
      days.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        sales: dayTotal,
      });
    }
    return days;
  }, [transactions]);
  
  // ---- Recent transactions (latest 5) ----
  const recentTx = transactions.slice(0, 5);

  return (
    <div className="p-6 space-y-5">
      {/* Stat cards */}
      <div className="flex flex-wrap gap-4">
        <StatCard
          icon={DollarSign}
          label="TODAY'S SALES"
          value={`KES ${todaysSales.toLocaleString()}`}
          sub={transactions.length > 0 ? `${transactions.length} total transactions` : "No sales yet"}
          subColor="text-emerald-600"
        />
        <StatCard
          icon={BedDouble}
          label="AVAILABLE ROOMS"
          value={totalRooms > 0 ? availableRooms : "—"}
          sub={totalRooms > 0 ? `Total Rooms: ${totalRooms}` : "No rooms added yet"}
          subColor="text-gray-400"
        />
        <StatCard
          icon={Users2}
          label="OCCUPIED ROOMS"
          value={totalRooms > 0 ? occupiedRooms : "—"}
          sub={totalRooms > 0 ? `${occupiedPct}% Occupied` : "No rooms added yet"}
          subColor="text-amber-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="LOW STOCK ITEMS"
          value={lowStockItems.length}
          sub={lowStockItems.length > 0 ? "Needs attention" : "All good"}
          subColor={lowStockItems.length > 0 ? "text-red-500" : "text-emerald-600"}
        />
      </div>
      
      {/* Chart + Stock summary + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-1">
            Sales Overview{" "}
            <span className="text-xs font-normal text-gray-400">(Last 7 Days)</span>
          </h2>
          <div className="h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(v) => [`KES ${v.toLocaleString()}`, "Sales"]} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke={GOLD_DARK}
                  strokeWidth={2.5}
                  dot={{ fill: GOLD_DARK, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4">Stock Summary</h2>
          <div className="space-y-4">
            {stockSummary.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-cente flex-shrink-0"
                  style={{ backgroundColor: s.color }}
                >
                  <Package size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {s.count} Items
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div lassName="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <h2 className="font-bold text-gray-900 mb-4">Low Stock Alerts</h2>
          <div className="space-y-3 flex-1 max-h-48 overflow-y-auto">
            {lowStockItems.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-6">
                No low stock items 🎉
              </div>
            )}
            {lowStockItems.map((item) => (
              <div key={item.id} className="fex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.qty === 0 ? "#EF4444" : "#F59E0B" }}
                  />
                  <span className="text-gray-700 text-sm">{item.name}</span>
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {item.qty} Left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-3">Recent Transactions</h2>
        {recentTx.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-6">
            No transactions yet. Make a sale in POS to see it here.
          </div>
        ) : (
          <table className="w-full tet-sm">
            <tbody>
              {recentTx.map((tx) => (
                <tr key={tx.id} className="border-t border-gray-50 first:border-none">
                  <td className="py-3 font-semibold text-gray-800">{tx.id}</td>
                  <td className="py-3 text-gray-600">
                    {tx.items.map((i) => `${i.name} x${i.qty}`).join(", ")}
                  </td>
                  <td className="py-3 font-semibold text-gray-800">
                    KES {tx.total.toLocaleString()}
                  </td>
                  <td className="py-3 text-gray-400 text-xs text-right">
                    {new Date(tx.date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
