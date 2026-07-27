import { CheckCircle2, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "./store";

const GOLD = "#D4A017";

export default function PointOfSale() {
  const { items, completeSale } = useStore();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({}); // { itemId: qty }
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }

  const filteredItems = items.filter((it) =>
    it.name.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(item) {
    setCart((c) => {
      const current = c[item.id] || 0;
      if (current >= item.qty) return c; // don't exceed stock
      return { ...c, [item.id]: current + 1 };
    });
  }

  function changeQty(id, delta) {
    setCart((c) => {
      const item = items.find((it) => it.id === id);
      const next = (c[id] || 0) + delta;
      if (next <= 0) {
        const { [id]: _, ...rest } = c;
        return rest;
      }
      if (item && next > item.qty) return c;
      return { ...c, [id]: next };
    });
  }

  function removeFromCart(id) {
    setCart((c) => {
      const { [id]: _, ...rest } = c;
      return rest;
    });
  }

  function clearCart() {
    setCart({});
    setMessage(null);
  }

  const cartLines = useMemo(
    () =>
      Object.entries(cart).map(([id, qty]) => {
        const item = items.find((it) => it.id === id);
        return item ? { ...item, qty } : null;
      }).filter(Boolean),
    [cart, items]
  );

  const subtotal = cartLines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const tax = 0; // adjust later if needed
  const total = subtotal + tax;

  function handleCompleteSale() {
    if (cartLines.length === 0) return;
    const result = completeSale(cartLines.map((l) => ({ id: l.id, qty: l.qty })));
    if (result.success) {
      setMessage({ type: "success", text: "Sale completed! Stock updated." });
      setCart({});
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Product list */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <ShoppingCart size={20} />
          Point of Sale (POS)
        </h1>
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/ -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredItems.map((item) => {
            const outOfStock = item.qty === 0;
            const inCart = cart[item.id] || 0;
            return (
              <button
                key={item.id}
                onClick={() => !outOfStock && addToCart(item)}
                disabled={outOfStock}
                className={`text-left border rounded-lg p-3 transition-colors ${outOfStock
                  ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                  : "border-gray-200 hover:border-amber-400 hover:bg-amber-50"
                  }`}
              >
                <div className="font-medum text-gray-800 text-sm">{item.name}</div>
                <div className="text-xs text-gray-400">{item.category}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold" style={{ color: GOLD }}>
                    KES {item.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {outOfStock ? "Out of stock" : `${item.qty} left`}
                  </span>
                </div>
                {inCart > 0 && (
                  <div className="mt-1 text-xs font-semibold text-emerald-600">
                    {inCart} in cart
                  </div>
                )}
              </button>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-8">
              No products found.
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
        <h2 className="font-bold text-gray-900 mb-3">Cart</h2>

        <div className="flex-1 space-y-3 overflow-y-auto max-h-96">
          {cartLines.length === 0 && (
            <div className="text-gray-400 text-sm text-center py-8">
              Cart is empty. Tap a product to add it.
            </div>
          )}
          {cartLines.map((line) => (
            <div key={line.id} className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {line.name}
                </div>
                <div className="text-xs text-gray-400">
                  KES {line.price.toLocaleString()} each
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => changeQty(line.id, -1)}
                  className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm font-medium">{line.qty}</span>
                <button
                  onClick={() => changeQty(line.id, 1)}
                  className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="text-sm font-semibold text-gray-800 w-16 text-right">
                {line.price * line.qty}
              </div>
              <button
                onClick={() => removeFromCart(line.id)}
                className="text-red-300 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>KES {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Tax</span>
            <span>KES {tax.toLocaleString()}</span>
          </div>
          <div
            className="flex justify-between items-center rounded-lg px-3 py-2.5 mt-2 text-white font-bold"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            <span>Total</span>
            <span>KES {total.toLocaleString()}</span>
          </div>
        </div>

        {message && (
          <div
            className={`mt-3 text-xs rounded-lg px-3 py-2 flex items-center gap-1.5 ${message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
              }`}
          >
            {message.type === "success" && <CheckCircle2 size={14} />}
            {message.text}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={clearCart}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
          >
            Clear Cart
          </button>
          <button
            onClick={handleCompleteSale}
            disabled={cartLines.length === 0}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-40"
            style={{ backgroundColor: GOLD }}
          >
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
}
