import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (item, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.item_id === item.item_id)
      if (idx !== -1) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty }
        return copy
      }
      return [...prev, { ...item, quantity: qty }]
    })
  }

  const removeItem = (itemId) => setItems(prev => prev.filter(i => i.item_id !== itemId))
  const clear = () => setItems([])
  const updateQty = (itemId, qty) => setItems(prev => prev.map(i => i.item_id === itemId ? { ...i, quantity: Math.max(1, qty) } : i))

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
    const tax = +(subtotal * 0.08).toFixed(2)
    const total = +(subtotal + tax).toFixed(2)
    return { subtotal, tax, total }
  }, [items])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, updateQty, totals }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
