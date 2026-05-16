import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import CustomerPage from './pages/CustomerPage'
import CustomerOrderPage from './pages/CustomerOrderPage'
import KitchenPage from './pages/KitchenPage'
import ManualOrderPage from './pages/ManualOrderPage'
import MenuEditPage from './pages/MenuEditPage'
import PaymentPage from './pages/PaymentPage'
import PaymentResultPage from './pages/PaymentResultPage'
import TrackOrderPage from './pages/TrackOrderPage'
import TrackSearchPage from './pages/TrackSearchPage'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<CustomerPage />} />
                <Route path="/menu-order" element={<CustomerOrderPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/manual-order" element={<ManualOrderPage />} />
                <Route path="/admin/menu" element={<MenuEditPage />} />
                <Route path="/kitchen" element={<KitchenPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/payment-result" element={<PaymentResultPage />} />
                <Route path="/track/search" element={<TrackSearchPage />} />
                <Route path="/track/:orderId" element={<TrackOrderPage />} />
                <Route path="*" element={<div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f7f2ea' }}><div style={{ borderRadius: 28, border: '1px solid #ead7be', background: 'white', padding: 40, textAlign: 'center' }}><h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a0f0a', margin: '0 0 10px' }}>Page not found</h1><p style={{ color: '#9a7a5a' }}>The page you requested does not exist.</p></div></div>} />
            </Routes>
        </BrowserRouter>
    )
}