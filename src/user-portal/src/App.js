import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import InventoryList from './pages/InventoryList';
import InventoryDetail from './pages/InventoryDetail';
import InventoryEdit from './pages/InventoryEdit';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import OrderForm from './pages/OrderForm';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <TenantProvider>
        <Sidebar />
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/products" />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/inventory/:id" element={<InventoryDetail />} />
            <Route path="/inventory/:id/edit" element={<InventoryEdit />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/new" element={<OrderForm />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Routes>
        </main>
      </TenantProvider>
    </BrowserRouter>
  );
}

export default App;
