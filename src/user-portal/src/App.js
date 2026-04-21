import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/auth/LoginPage';
import ProductList from './pages/ProductList';
import InventoryList from './pages/InventoryList';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import './App.css';

function AppLayout({ children }) {
  return (
    <>
      <Sidebar />
      <Header />
      <main className="main-content">{children}</main>
    </>
  );
}

function Protected({ children }) {
  return <ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products" element={<Protected><ProductList /></Protected>} />
          <Route path="/inventory" element={<Protected><InventoryList /></Protected>} />
          <Route path="/orders" element={<Protected><OrderList /></Protected>} />
          <Route path="/orders/:id" element={<Protected><OrderDetail /></Protected>} />
          <Route path="*" element={<Navigate to="/products" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
