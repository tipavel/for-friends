import type { MenuItem } from '../types'

export const initialMenu: MenuItem[] = [
    { id: 1, name: 'Espresso', cat: 'hot', price: 2.5, emoji: '☕', desc: 'Rich, bold single shot', avail: true },
    { id: 2, name: 'Cappuccino', cat: 'hot', price: 4.5, emoji: '☕', desc: 'Espresso with steamed milk foam', avail: true },
    { id: 3, name: 'Latte', cat: 'hot', price: 5.0, emoji: '🥛', desc: 'Smooth espresso & steamed milk', avail: true },
    { id: 4, name: 'Flat White', cat: 'hot', price: 4.8, emoji: '☕', desc: 'Velvety microfoam espresso', avail: true },
    { id: 5, name: 'Americano', cat: 'hot', price: 3.5, emoji: '☕', desc: 'Espresso with hot water', avail: true },
    { id: 6, name: 'Mocha', cat: 'hot', price: 5.5, emoji: '🍫', desc: 'Chocolate espresso delight', avail: true },
    { id: 7, name: 'Iced Latte', cat: 'cold', price: 5.5, emoji: '🧊', desc: 'Cold milk & espresso over ice', avail: true },
    { id: 8, name: 'Cold Brew', cat: 'cold', price: 4.8, emoji: '🌑', desc: '12-hour steeped smooth coffee', avail: true },
    { id: 9, name: 'Frappuccino', cat: 'cold', price: 6.0, emoji: '🥤', desc: 'Blended iced coffee perfection', avail: true },
    { id: 10, name: 'Iced Matcha', cat: 'cold', price: 5.8, emoji: '🍵', desc: 'Premium ceremonial grade matcha', avail: true },
    { id: 11, name: 'Earl Grey', cat: 'tea', price: 3.5, emoji: '🫖', desc: 'Bergamot-infused black tea', avail: true },
    { id: 12, name: 'Chai Latte', cat: 'tea', price: 4.8, emoji: '🌶️', desc: 'Spiced tea with steamed milk', avail: true },
    { id: 13, name: 'Matcha Latte', cat: 'tea', price: 5.5, emoji: '🍵', desc: 'Japanese green tea & oat milk', avail: true },
    { id: 14, name: 'Butter Croissant', cat: 'food', price: 3.8, emoji: '🥐', desc: 'Flaky, golden, freshly baked', avail: true },
    { id: 15, name: 'Avocado Toast', cat: 'food', price: 8.5, emoji: '🥑', desc: 'Sourdough, smashed avo, chili', avail: true },
    { id: 16, name: 'Blueberry Muffin', cat: 'food', price: 3.5, emoji: '🫐', desc: 'Fresh baked every morning', avail: true },
    { id: 17, name: 'Club Sandwich', cat: 'food', price: 9.5, emoji: '🥪', desc: 'Triple decker with chips', avail: true }
]