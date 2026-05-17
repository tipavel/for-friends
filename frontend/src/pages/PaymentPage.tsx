import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { type CreateOrderRequest } from '../services/api'

declare global {
    interface Window {
        Moyasar?: {
            init: (config: Record<string, unknown>) => void
        }
    }
}

const PUBLISHABLE_KEY = 'pk_live_qL3rVu5ZHSDhR9AM623H1x9TRDHVjASbC5p2rHi7'
const CALLBACK_URL = `${window.location.origin}/payment-result`

const MOYASAR_CSS_URL = 'https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.2.7/dist/moyasar.css'
const MOYASAR_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.2.7/dist/moyasar.umd.min.js'

function loadCss(href: string, id: string) {
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id; link.rel = 'stylesheet'; link.href = href
    document.head.appendChild(link)
}

function loadScript(src: string, id: string) {
    return new Promise<void>((resolve, reject) => {
        const existing = document.getElementById(id) as HTMLScriptElement | null
        if (existing) {
            if (window.Moyasar) resolve()
            else existing.addEventListener('load', () => resolve(), { once: true })
            return
        }
        const script = document.createElement('script')
        script.id = id; script.src = src; script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Moyasar script'))
        document.head.appendChild(script)
    })
}

export default function PaymentPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [error, setError] = useState('')
    const [ready, setReady] = useState(false)
    const [orderSummary, setOrderSummary] = useState<{ total: number; itemCount: number } | null>(null)

    const method = useMemo(() => {
        const query = new URLSearchParams(location.search)
        const raw = query.get('method')
        return raw === 'stcpay' ? 'stcpay' : 'creditcard'
    }, [location.search])

    useEffect(() => {
        const pendingRaw = sessionStorage.getItem('pendingCheckout')
        if (!pendingRaw) { setError('No pending checkout found. Please go back and try again.'); return }

        const pendingOrder = JSON.parse(pendingRaw) as CreateOrderRequest & { total?: number }

        // ── FIX: use the pre-calculated total stored at checkout time ──────────
        // The old approach recomputed subtotal from priceMap, but if priceMap was
        // missing, stale, or IDs didn't match (e.g. sized items), subtotal = 0
        // and Moyasar throws "Form configuration issue" because amount = 0.
        //
        // Instead we store the final total in pendingCheckout (added below) and
        // fall back to recomputing only if it's absent (backward compat).
        let total: number
        let itemCount: number = pendingOrder.items.reduce((s, i) => s + i.qty, 0)

        if (typeof pendingOrder.total === 'number' && pendingOrder.total > 0) {
            // Fast path — total was stored directly (new flow)
            total = pendingOrder.total
        } else {
            // Fallback — recompute from priceMap (old flow)
            const priceMapRaw = sessionStorage.getItem('checkoutPriceMap')
            const priceMap: Record<string, number> = priceMapRaw ? JSON.parse(priceMapRaw) : {}
            const subtotal = pendingOrder.items.reduce((sum, item) => {
                const price = priceMap[String(item.id)] ?? 0
                return sum + price * item.qty
            }, 0)
            const tax = Math.round(subtotal * 0.15 * 100) / 100
            total = Math.round((subtotal + tax) * 100) / 100
        }

        // Guard: if total is still 0 or NaN, show a clear error instead of
        // letting Moyasar show a cryptic "Form configuration issue"
        if (!total || total <= 0 || isNaN(total)) {
            setError('Could not calculate order total. Please go back and try again.')
            return
        }

        const amount = Math.round(total * 100) // halalas — must be integer > 0

        setOrderSummary({ total, itemCount })

        let cancelled = false

        async function init() {
            try {
                loadCss(MOYASAR_CSS_URL, 'moyasar-css')
                await loadScript(MOYASAR_SCRIPT_URL, 'moyasar-script')
                if (cancelled) return
                if (!window.Moyasar) throw new Error('Moyasar failed to load.')

                const container = document.querySelector('.mysr-form')
                if (container) container.innerHTML = ''

                window.Moyasar.init({
                    element: '.mysr-form',
                    amount,
                    currency: 'SAR',
                    description: `For Friends order${pendingOrder.name ? ' for ' + pendingOrder.name : ''}`,
                    publishable_api_key: PUBLISHABLE_KEY,
                    callback_url: CALLBACK_URL,
                    supported_networks: ['mada', 'visa', 'mastercard'],
                    methods: [method],
                })

                setReady(true)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize payment')
            }
        }

        init()
        return () => { cancelled = true }
    }, [method])

    return (
        <div style={{ minHeight: '100vh', background: '#080502', color: '#f5e0c0', fontFamily: "'DM Sans',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(16px,4vw,40px)', paddingTop: 'clamp(24px,5vw,60px)' }}>
            <div style={{ width: '100%', maxWidth: 500 }}>

                <button onClick={() => navigate(-1)} style={{ marginBottom: 24, padding: '8px 18px', borderRadius: 999, border: '1px solid rgba(245,220,180,0.15)', background: 'transparent', color: 'rgba(245,220,180,0.55)', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', touchAction: 'manipulation' }}>
                    ← Back
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <span style={{ fontSize: 28 }}>{method === 'stcpay' ? '📱' : '💳'}</span>
                    <h1 style={{ margin: 0, fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, fontFamily: "'Cormorant Garamond',serif" }}>
                        {method === 'stcpay' ? 'Pay with STC Pay' : 'Pay with Card'}
                    </h1>
                </div>
                <p style={{ color: 'rgba(245,220,180,0.45)', fontSize: 14, marginBottom: 20 }}>
                    {method === 'stcpay' ? 'Enter your STC Pay number to complete payment' : 'Mada · Visa · Mastercard accepted'}
                </p>

                {orderSummary && (
                    <div style={{ background: 'rgba(192,125,64,0.1)', border: '1px solid rgba(192,125,64,0.2)', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: 'rgba(245,220,180,0.55)' }}>{orderSummary.itemCount} item{orderSummary.itemCount !== 1 ? 's' : ''}</span>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#c07d40', fontFamily: "'Cormorant Garamond',serif" }}>SAR {orderSummary.total.toFixed(2)}</span>
                    </div>
                )}

                {error ? (
                    <div style={{ borderRadius: 18, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', padding: '16px 20px', color: '#fca5a5', fontSize: 14, marginBottom: 16 }}>
                        ⚠️ {error}
                        <div style={{ marginTop: 12 }}>
                            <button onClick={() => navigate(-1)} style={{ padding: '8px 18px', borderRadius: 999, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#fca5a5', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>← Go back</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ borderRadius: 24, border: '1px solid rgba(192,125,64,0.18)', background: '#14100c', padding: 'clamp(16px,3vw,28px)', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
                        {!ready && (
                            <div style={{ marginBottom: 16, fontSize: 14, color: 'rgba(245,220,180,0.4)', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                <span style={{ animation: 'spin 1.5s linear infinite', display: 'inline-block', fontSize: 18 }}>⏳</span>
                                Loading payment form...
                            </div>
                        )}
                        <div className="mysr-form" />
                    </div>
                )}

                <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'rgba(245,220,180,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    🔒 Secured by Moyasar · PCI DSS Compliant
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800;900&family=DM+Sans:wght@400;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .mysr-form label { color: rgba(245,220,180,0.7) !important; font-size: 13px !important; font-family: 'DM Sans', sans-serif !important; }
                .mysr-form input { background: rgba(255,255,255,0.06) !important; border: 1px solid rgba(192,125,64,0.25) !important; color: #f5e0c0 !important; border-radius: 12px !important; font-family: 'DM Sans', sans-serif !important; padding: 11px 14px !important; }
                .mysr-form input:focus { border-color: rgba(192,125,64,0.6) !important; outline: none !important; }
                .mysr-form input::placeholder { color: rgba(245,220,180,0.25) !important; }
                .mysr-form button[type="submit"] { background: linear-gradient(135deg,#c07d40,#8b4f1c) !important; border: none !important; border-radius: 999px !important; font-weight: 800 !important; font-size: 15px !important; padding: 14px !important; box-shadow: 0 6px 24px rgba(192,125,64,0.4) !important; font-family: 'DM Sans', sans-serif !important; }
                .mysr-form button[type="submit"]:hover { opacity: 0.9 !important; }
                .mysr-form .mysr-card { background: transparent !important; }
            `}</style>
        </div>
    )
}