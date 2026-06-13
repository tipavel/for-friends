const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5027/api'
export const IMAGE_BASE = API_BASE.replace('/api', '')

export type CategoryKey = string
export type OrderStatus = 'new' | 'preparing' | 'ready' | 'done'
export type PaymentMethod = 'pickup' | 'creditcard' | 'stcpay'
export type PaymentStatus = 'unpaid' | 'paid' | 'failed'

export type Category = { id: number; key: string; name: string; nameAr: string; sortOrder: number; active: boolean }
export type ItemSizeOption = { key: string; label: string; labelAr?: string; price: number; active: boolean; isDefault: boolean }
export type MenuItem = {
    id: number; name: string; nameAr: string; cat: CategoryKey; price: number; emoji: string; desc: string; descAr: string;
    avail: boolean; calories: number; imageUrl: string; sortOrder: number; sizesJson: string
}
export function parseItemSizes(item: MenuItem): ItemSizeOption[] {
    if (!item.sizesJson) return []
    try { return JSON.parse(item.sizesJson) as ItemSizeOption[] } catch { return [] }
}
export type OrderItem = { id: number; name: string; price: number; emoji: string; qty: number }
export type Order = {
    id: string; name: string; phone: string; notes: string; pickup: string; status: OrderStatus;
    paymentMethod: PaymentMethod; paymentStatus: PaymentStatus; paymentId: string; paymentMessage: string;
    items: OrderItem[]; subtotal: number; discount: number; promoCode: string; tax: number; total: number; time: string
}
export type CreateOrderRequest = {
    name: string; phone: string; notes: string; pickup: string; paymentMethod: PaymentMethod; promoCode: string; items: { id: number; qty: number }[]
}
export type PromoCode = { id: number; code: string; discountPercent: number; active: boolean; expiresAt: string | null; maxUses: number; useCount: number }
export type PromoValidateResult = { code: string; discountPercent: number; discountAmount: number; message: string }
export type Offer = { id: number; title: string; titleAr: string; subtitle: string; subtitleAr: string; emoji: string; bgColor: string; ctaLabel: string; ctaLink: string; active: boolean; sortOrder: number }
export type LoginRequest = { username: string; password: string }
export type MoyasarConfig = { publishableKey: string; callbackUrl: string; currency: string }
export type VerifyPaymentAndCreateOrderRequest = { paymentId: string; order: CreateOrderRequest }
export type AnalyticsSummary = { totalOrders: number; revenue: number; pending: number; avgOrder?: number; statusBreakdown?: { new: number; preparing: number; ready: number; done: number }; topItems?: { name: string; count: number }[] }
export type AppSetting = {
    id: number
    taxPercent: number
    editableFooterEn: string
    editableFooterAr: string
    pickupLocation: string
    pickupPhone: string
    // Size multipliers
    sizeSmMult: number; sizeMdMult: number; sizeLgMult: number
    sizeSmLabel: string; sizeMdLabel: string; sizeLgLabel: string
    sizeSmActive: boolean; sizeMdActive: boolean; sizeLgActive: boolean
    sizeDefaultKey: string
    // Contact & Address
    address: string
    email: string
    whatsapp: string
    // Social media
    instagram: string
    facebook: string
    twitter: string
    snapchat: string
    // Opening hours
    hoursSatThuEn: string
    hoursFriEn: string
    hoursSatThuAr: string
    hoursFriAr: string
}
export type StaffAccount = { id: number; name: string; username: string; password: string; role: string; active: boolean }
export type CustomerProfile = { id: number; name: string; phone: string; lastNotes: string; lastPickup: string; totalOrders: number; lastOrderAt: string }

export function getImageUrl(imageUrl: string) {
    if (!imageUrl) return ''
    if (imageUrl.startsWith('http')) return imageUrl
    return `${IMAGE_BASE}${imageUrl}`
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const headers = options?.body instanceof FormData ? { ...(options?.headers ?? {}) } : { 'Content-Type': 'application/json', ...(options?.headers ?? {}) }
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
    if (!res.ok) {
        const text = await res.text()
        try {
            const json = JSON.parse(text)
            const msg = json.message || json.title || json.detail || `Request failed: ${res.status}`
            const err = new Error(msg) as Error & { status: number }
            err.status = res.status
            throw err
        } catch (e) {
            if (e instanceof Error && (e as any).status) throw e
            throw new Error(text || `Request failed: ${res.status}`)
        }
    }
    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
}

export const api = {
    login: (body: LoginRequest) => request<{ success: boolean; token: string; user: { username: string; role: string; name?: string } }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    getMenu: () => request<MenuItem[]>('/menu'),
    createMenuItem: (body: Omit<MenuItem, 'id'>) => request<MenuItem>('/menu', { method: 'POST', body: JSON.stringify(body) }),
    updateMenuItem: (id: number, body: Omit<MenuItem, 'id'>) => request<MenuItem>(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    uploadMenuImage: async (file: File) => { const form = new FormData(); form.append('file', file); const res = await fetch(`${API_BASE}/menu/upload-image`, { method: 'POST', body: form }); if (!res.ok) throw new Error('Image upload failed'); return (await res.json()).url as string },
    deleteMenuItem: (id: number) => request<void>(`/menu/${id}`, { method: 'DELETE' }),
    getOrders: () => request<Order[]>('/orders'),
    getOrder: (id: string) => request<Order>(`/orders/${id}`),
    createOrder: (body: CreateOrderRequest) => request<Order>('/orders', { method: 'POST', body: JSON.stringify(body) }),
    updateOrderStatus: (id: string, status: OrderStatus) => request<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    deleteOrder: (id: string) => request<void>(`/orders/${id}`, { method: 'DELETE' }),
    getAnalytics: () => request<AnalyticsSummary>('/analytics/summary'),
    getMoyasarConfig: () => request<MoyasarConfig>('/payments/config'),
    verifyPaymentAndCreateOrder: (body: VerifyPaymentAndCreateOrderRequest) => request<Order>('/payments/verify-and-create-order', { method: 'POST', body: JSON.stringify(body) }),
    getPromoCodes: () => request<PromoCode[]>('/promo'),
    validatePromo: (code: string, subtotal: number) => request<PromoValidateResult>(`/promo/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`, { method: 'POST' }),
    createPromoCode: (body: Omit<PromoCode, 'id' | 'useCount'>) => request<PromoCode>('/promo', { method: 'POST', body: JSON.stringify(body) }),
    deletePromoCode: (id: number) => request<void>(`/promo/${id}`, { method: 'DELETE' }),
    togglePromoCode: (id: number) => request<PromoCode>(`/promo/${id}/toggle`, { method: 'PATCH' }),
    getActiveOffers: () => request<Offer[]>('/offers/active'),
    getAllOffers: () => request<Offer[]>('/offers'),
    createOffer: (body: Omit<Offer, 'id'>) => request<Offer>('/offers', { method: 'POST', body: JSON.stringify(body) }),
    updateOffer: (id: number, body: Omit<Offer, 'id'>) => request<Offer>(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteOffer: (id: number) => request<void>(`/offers/${id}`, { method: 'DELETE' }),
    getCategories: () => request<Category[]>('/categories'),
    createCategory: (body: Omit<Category, 'id'>) => request<Category>('/categories', { method: 'POST', body: JSON.stringify(body) }),
    updateCategory: (id: number, body: Omit<Category, 'id'>) => request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteCategory: (id: number) => request<void>(`/categories/${id}`, { method: 'DELETE' }),
    getSettings: () => request<AppSetting>('/settings'),
    updateSettings: (body: AppSetting) => request<AppSetting>('/settings', { method: 'PUT', body: JSON.stringify(body) }),
    getStaffAccounts: () => request<StaffAccount[]>('/staffaccounts'),
    createStaffAccount: (body: Omit<StaffAccount, 'id'>) => request<StaffAccount>('/staffaccounts', { method: 'POST', body: JSON.stringify(body) }),
    updateStaffAccount: (id: number, body: Omit<StaffAccount, 'id'>) => request<StaffAccount>(`/staffaccounts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteStaffAccount: (id: number) => request<void>(`/staffaccounts/${id}`, { method: 'DELETE' }),
    getCustomers: (q = '') => request<CustomerProfile[]>(`/customers?q=${encodeURIComponent(q)}`),
}