import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TenantList from './pages/TenantList';
import TenantForm from './pages/TenantForm';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/tenants" />} />
          <Route path="/tenants" element={<TenantList />} />
          <Route path="/tenants/new" element={<TenantForm />} />
          <Route path="/tenants/:id/edit" element={<TenantForm />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
