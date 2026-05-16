import type { Order } from '../types'

export const demoOrders: Order[] = [
    {
        id: 'B1000',
        name: 'Alice M.',
        phone: '',
        notes: 'Oat milk please',
        pickup: 'ASAP',
        status: 'new',
        items: [
            { id: 3, name: 'Latte', cat: 'hot', price: 5, emoji: '🥛', desc: 'Smooth espresso & steamed milk', avail: true, qty: 1 },
            { id: 14, name: 'Butter Croissant', cat: 'food', price: 3.8, emoji: '🥐', desc: 'Flaky, golden, freshly baked', avail: true, qty: 1 }
        ],
        subtotal: 8.8,
        tax: 0.704,
        total: 9.504,
        time: new Date().toISOString()
    },
    {
        id: 'B1001',
        name: 'James R.',
        phone: '',
        notes: '',
        pickup: 'ASAP',
        status: 'preparing',
        items: [
            { id: 7, name: 'Iced Latte', cat: 'cold', price: 5.5, emoji: '🧊', desc: 'Cold milk & espresso over ice', avail: true, qty: 2 }
        ],
        subtotal: 11,
        tax: 0.88,
        total: 11.88,
        time: new Date().toISOString()
    }
]