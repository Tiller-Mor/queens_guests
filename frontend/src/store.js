// store.js
// Single source of truth for stock + sales data.
// Currently backed by localStorage. Later, swap the internals of these
// functions to call a real backend/API — components using useStore()
// won't need to change.

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "queens_guest_house_data_v1";

// ---- Seed data: real Queens Guest House menu ----
// Prices are placeholders (0) — edit real prices in Stock Management.
// Default qty is 20 as a starting stock leve — adjust as needed.
const PLACEHOLDER_PRICE = 0;
const DEFAULT_QTY = 20;

function makeItem(id, name, category) {
  return { id, name, category, price: PLACEHOLDER_PRICE, qty: DEFAULT_QTY };
}

const seedData = {
  items: [
    // ---- Food ----
    makeItem("f-tea-normal", "Tea Normal (Nescafe)", "Food"),
    makeItem("f-tea-strong", "Tea Strong (Nescafe)", "Food"),
    makeItem("f-uji", "Uji", "Food"),
    makeItem("f-ugali", "Ugali - Kienyeji", "Food"),
    makeItem("f-eggs", "Eggs", "Food"),
    makeItem("f-fish", "Fish", "Food"),
    makeItem("f-kuku", "Kuku", "Food"),

    // ---- Refreshments (beers, spirits, energy drinks, soft drinks) ----
    makeItem("rf-guinness", "Guinness", "Refreshments"),
    makeItem("rf-balozi", "Balozi", "Refreshments"),
    makeItem("rf-pilsner", "Pilsner", "Refreshments"),
    makeItem("rf-white-cap", "White Cap", "Refreshments"),
    makeItem("rf-tusker", "Tusker", "Refreshments"),
    makeItem("rf-allsopps", "Allsopps", "Refreshments"),
    makeItem("rf-smirnoff", "Smirnoff Ice", "Refreshments"),
    makeItem("rf-born", "Born", "Refreshments"),
    makeItem("rf-viceroy", "Viceroy", "Refreshments"),
    makeItem("rf-richot", "Richot", "Refreshments"),
    makeItem("rf-gilbeys", "Gilbey's", "Refreshments"),
    makeItem("rf-chrome", "Chrome", "Refreshments"),
    makeItem("rf-triple-s", "Triple S", "Refreshments"),
    makeItem("rf-ken-extra", "KenExtra", "Refreshments"),
    makeItem("rf-general-mkt", "General Malting's", "Refreshments"),
    makeItem("rf-caprice", "Caprice", "Refreshments"),
    makeItem("rf-guarana", "Guarana", "Refreshments"),
    makeItem("rf-red-bull", "Red Bull", "Refreshments"),
    makeItem("rf-vat69", "V&A", "Refreshments"),
    makeItem("rf-kenya-cane", "Kenya Cane", "Refreshments"),
    makeItem("rf-captain-morgan", "Captain Morgan", "Refreshments"),
    makeItem("rf-county", "County", "Refreshments"),
    makeItem("rf-hunters", "Hunters", "Refreshments"),
    makeItem("rf-kibao", "Kibao", "Refreshments"),
    makeItem("rf-water", "Watr", "Refreshments"),
    makeItem("rf-soda", "Soda", "Refreshments"),
    makeItem("rf-delmonte", "Delmonte", "Refreshments"),
    makeItem("rf-afya", "Afya", "Refreshments"),
    makeItem("rf-minute-maid", "Minute Maid", "Refreshments"),
    makeItem("rf-predator", "Predator", "Refreshments"),
    makeItem("rf-play", "Play", "Refreshments"),
    makeItem("rf-charged", "Charged", "Refreshments"),
  ],
  transactions: [],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load stored data, using seed data:", e);
  }
  return seedData;
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data:", e);
  }
}

// Simple pub-sub so multiple components using useStore() stay in sync
let listeners = [];
let state = loadData();

function notify() {
  listeners.forEach((l) => l(state));
}

function setState(updater) {
  state = typeof updater === "function" ? updater(state) : updater;
  saveData(state);
  notify();
}

// ---- Core actions ----

/** Add a brand new stock item */
function addItem({ name, category, price, qty }) {
  setState((s) => ({
    ...s,
    items: [
      ...s.items,
      { id: `${category.toLowerCase()}-${Date.now()}`, name, category, price, qty },
    ],
  }));
}

/** Update an existing item's fields (name/price/qty/category) */
function updateItem(id, updates) {
  setState(
    (s) => ({
      ...s, items: s.items.map((it) => (it.id === id ? { ...it, ...updates } : it)),
    }))
}

/** Remove an item entirely */
function deleteItem(id) {
  setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
}

/** Restock: increase quantity of an existing item */
function restockItem(id, amount) {
  setState((s) => ({
    ...s,
    items: s.items.map((it) =>
      it.id === id ? { ...it, qty: it.qty + amount } : it
    ),
  }));
}

/**
 * Complete a sale.
 * cartItems: [{ id, qty ] — the quantities being sold right now.
 * Automatically deducts stock and records a transaction.
 * Returns { success, error } — fails if any item doesn't have enough stock.
 */
function completeSale(cartItems) {
  let error = null;

  setState((s) => {
    // Validate stock first
    for (const cartItem of cartItems) {
      const stockItem = s.items.find((it) => it.id === cartItem.id);
      if (!stockItem) {
        error = `Item not found: ${cartItem.id}`;
        return s;
      }
      if (stockItem.qty < cartItem.qty) {
        error = `Not enough stock for ${stockItem.name} (only ${stockItem.qty} left)`;
        return s;
      }
    }
    if (error) return s;

    // Deduct stock
    const newItems = s.items.map((it) => {
      const sold = cartItems.find((c) => c.id === it.id);
      return sold ? { ...it, qty: it.qty - sold.qty } : it;
    });

    // Build transaction record
    const total = cartItems.reduce((sum, c) => {
      const stockItem = s.items.find((it) => it.id === c.id);
      return sum + stockItem.price * c.qty;
    }, 0);

    const transaction = {
      id: `TXN-${Date.now()}`,
      date: new Date().toISOString(),
      items: cartItems.map((c) => {
        const stockItem = s.items.find((it) => it.id === c.id);
        return {
          id: c.id,
          name: stockItem.name,
          qty: c.qty,
          price: stockItem.price,
          subtotal: stockItem.price * c.qty,
        };
      }),
      total,
    };

    return {
      ...s,
      items: newItems,
      transactions: [transaction, ...s.transactions],
    };
  });

  return { success: !error, error };
}

/** Reset everything back to seed data (handy for testing) */
function resetData() {
  setState(seedData);
}

// ---- React hook ----
export function useStore() {
  const [localState, setLocalState] = useState(state);

  useEffect(() => {
    listeners.push(setLocalState);
    return () => {
      listeners = listeners.filter((l) => l !== setLocalState);
    };
  }, []);

  const sell = useCallback((cartItems) => completeSale(cartItems), []);

  return {
    items: localState.items,
    transactions: localState.transactions,
    addItem,
    updateItem,
    deleteItem,
    restockItem,
    completeSale: sell,
    resetData,
  };
}
