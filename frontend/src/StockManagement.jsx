import { useState } from "react";
import { Package, Plus, Pencil, Trash2, Search } from "lucide-react";
import { useStore } from "./store";

const GOLD = "#D4A017";

const CATEGORIES = ["All", "Refreshments", "Food", "Rooms"];

function StatusBadge({ qty }) {
  let label = "Normal";
  let classes = "bg-green-100 text-green-700";
  if (qty === 0) {
    label = "Out of Stock";
    classes = "bg-red-100 text-red-700";
  } else if (qty <= 5) {
    label = "Low Stock";
    classes = "bg-red-100 text-red-700";
  }
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}

export default function StockManagement() {
  const { items, addItem, updateItem, deleteItem } = useStore();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Refreshments",
    price: "",
    qty: "",
  });

  const filtered = items.filter((it) => {
    const matchesCategory = category === "All" || it.category === category;
    const matchesSearch = it.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function startEdit(item) {
    setEditingId(item.id);
    setEditDraft({ name: item.name, price: item.price, qty: item.qty });
  }

  function saveEdit(id) {
    updateItem(id, {
      name: editDraft.name,
      price: Number(editDraft.price),
      qty: Number(editDraft.qty),
    });
    setEditingId(null);
  }

  function handleAddItem() {
    if (!newItem.name || newItem.price === "" || newItem.qty === "") return;
    addItem({
      name: newItem.name,
      category: newItem.category,
      price: Number(newItem.price),
      qty: Number(newItem.qty),
    });
    setNewItem({ name: "", category: "Refreshments", price: "", qty: "" });
    setShowAddForm(false);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Package size={20} />
          Stock Management
        </h1>
        <button
          onClick={() => setShowAddForm((s) => !s)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold"
          style={{ backgroundColor: GOLD }}
        >
          <Plus size={16} />
          Add Stock
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-medium text-gray-500">Name</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="e.g. Fanta"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Category</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              value={newItem.category}
              onChange={(e) =>
                setNewItem({ ...newItem, category: e.target.value })
              }
            >
              <option>Refreshments</option>
              <option>Food</option>
              <option>Rooms</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Price (KES)</label>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, pric: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Quantity</label>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              value={newItem.qty}
              onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
            />
          </div>
          <button
            onClick={handleAddItem}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
          style={{ backgroundColor: GOLD }}
          >
          Save
        </button>
        </div>
  )
}
    
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
         ))}
        </select>
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm"
            placeholder="Search item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white runded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
              <th className="py-3 px-4">Item Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Qty In Stock</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Status</th>
              <th clasName="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <tr key={item.id} className="border-b border-gray-50 last:border-none">
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {isEditing ? (
                      <input
                        className="border border-gray-200 rounded px-2 py-1 text-sm wfull"
                        value={editDraft.name}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, name: e.target.value })
                        }
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-500">{item.category}</td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                     <input
                        type="number"
                        className="border border-gray-200 rounded px-2 py-1 text-sm w-20"
                        value={editDraft.qty}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, qty: e.target.value })
                        }
                      />
                    ) : (
                      item.qty
                    )}
                  </td>
                  <td className="py-3 px-4">
                   {isEditing ? (
                      <input
                        type="number"
                        className="border border-gray-200 rounded px-2 py-1 text-sm w-24"
                        value={editDraft.price}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, price: e.target.value })
                        }
                      />
                    ) : (
                      `KES ${item.price.toLocaleString()}`)
                    }
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge qty={item.qty} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="text-xs font-semibold text-white px-3 py-1 rounded-md"
                          style={{ ackgroundColor: GOLD }}
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No items found.
                </td>
              </tr>
           )}
          </tbody>
        </table>
      </div>
    </div >
  );
}
