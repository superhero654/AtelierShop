import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const CartContext = createContext(null);
const CART_KEY = 'cartItems';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadFromStorage(CART_KEY, []));

  useEffect(() => {
    saveToStorage(CART_KEY, items);
  }, [items]);

  const addToCart = useCallback((good, count = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.goodId === good.id);
      if (existing) {
        return prev.map((item) =>
          item.goodId === good.id
            ? { ...item, count: item.count + count }
            : item
        );
      }
      return [
        ...prev,
        {
          goodId: good.id,
          name: good.name,
          price: good.price,
          img: good.img,
          count,
          selected: true,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((goodId) => {
    setItems((prev) => prev.filter((item) => item.goodId !== goodId));
  }, []);

  const updateCount = useCallback((goodId, count) => {
    if (count < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.goodId === goodId ? { ...item, count } : item
      )
    );
  }, []);

  const toggleSelect = useCallback((goodId) => {
    setItems((prev) =>
      prev.map((item) =>
        item.goodId === goodId ? { ...item, selected: !item.selected } : item
      )
    );
  }, []);

  const toggleSelectAll = useCallback((selected) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected })));
  }, []);

  const clearSelected = useCallback(() => {
    setItems((prev) => prev.filter((item) => !item.selected));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const selectedItems = useMemo(
    () => items.filter((item) => item.selected),
    [items]
  );

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.count, 0),
    [items]
  );

  const selectedTotal = useMemo(
    () =>
      selectedItems.reduce((sum, item) => sum + item.price * item.count, 0),
    [selectedItems]
  );

  const allSelected = useMemo(
    () => items.length > 0 && items.every((item) => item.selected),
    [items]
  );

  const value = {
    items,
    selectedItems,
    totalCount,
    selectedTotal,
    allSelected,
    addToCart,
    removeFromCart,
    updateCount,
    toggleSelect,
    toggleSelectAll,
    clearSelected,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default CartContext;
