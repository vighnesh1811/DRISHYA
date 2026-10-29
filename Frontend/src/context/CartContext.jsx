import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const storageKey = 'drishya_rental_cart';
const datesStorageKey = 'drishya_rental_dates';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem(storageKey) || '[]'));
  const [dates, setDatesState] = useState(() => JSON.parse(localStorage.getItem(datesStorageKey) || '{"startDate":"","endDate":""}'));
  useEffect(() => localStorage.setItem(storageKey, JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem(datesStorageKey, JSON.stringify(dates)), [dates]);
  const value = useMemo(() => ({
    items, dates, setDates: (nextDates) => setDatesState(nextDates),
    addItem(item, quantity = 1) {
      setItems((current) => {
        const existing = current.find((entry) => entry.id === item.id);
        return existing ? current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + quantity } : entry) : [...current, { ...item, quantity }];
      });
    },
    removeItem(id) { setItems((current) => current.filter((item) => item.id !== id)); },
    clear() { setItems([]); setDatesState({ startDate: '', endDate: '' }); }
  }), [items, dates]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
