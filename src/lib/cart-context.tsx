'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export interface CartItem {
  id: string; // unique key in cart: `${classId}_${date}_${timeSlot}`
  classId: string;
  classTitle: string;
  subtitle?: string;
  classType: 'online' | 'onsite';
  price: number;
  isFree: boolean;
  rewardPoints: number;
  image: string;
  date: string;
  timeSlot: string;
  durationText?: string;
  level?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateItemSlot: (id: string, date: string, timeSlot: string) => void;
  clearCart: () => void;
  totalAmount: number;
  totalPoints: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isInCart: (classId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'kevin_ai_course_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever items change (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [items, isLoaded]);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    setItems(prev => {
      // Check if this class is already in cart
      const existingIdx = prev.findIndex(i => i.classId === item.classId);
      const uniqueId = `${item.classId}_${item.date}_${item.timeSlot}`;
      
      if (existingIdx >= 0) {
        // Update existing item with the newly selected date & slot
        const updated = [...prev];
        updated[existingIdx] = { ...item, id: uniqueId };
        return updated;
      }
      return [...prev, { ...item, id: uniqueId }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id && item.classId !== id));
  }, []);

  const updateItemSlot = useCallback((id: string, date: string, timeSlot: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id || item.classId === id) {
        return {
          ...item,
          id: `${item.classId}_${date}_${timeSlot}`,
          date,
          timeSlot
        };
      }
      return item;
    }));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const isInCart = useCallback((classId: string) => {
    return items.some(i => i.classId === classId);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.isFree ? 0 : (item.price || 0)), 0);
  }, [items]);

  const totalPoints = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.rewardPoints || Math.round((item.price || 0) / 10)), 0);
  }, [items]);

  const totalItems = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemSlot,
        clearCart,
        totalAmount,
        totalPoints,
        totalItems,
        isCartOpen,
        setIsCartOpen,
        isInCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
