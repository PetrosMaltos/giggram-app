// src/store.js
import create from 'zustand';

export const useOrderStore = create((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  fetchOrders: async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      set({ orders: data });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  },
}));
