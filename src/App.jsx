import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Vistas
import Menu from './views/cliente/Menu';
import Checkout from './views/cliente/Checkout';
import Login from './views/auth/Login';
import MonitorCocina from './views/cocina/Monitor';
import PanelMozo from './views/mozo/PanelMozo';
import Inventario from './views/admin/Inventario';
import GestionMesas from './views/admin/Mesas';
import GestionCategorias from './views/admin/Categorias';
import GestionUsuarios from './views/admin/Usuarios';
import CajaPedidos from './views/admin/Caja'; 

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. LA VITRINA ES PÚBLICA: Todos pueden entrar a ver el menú */}
          <Route path="/" element={<Menu />} />
          <Route path="/menu" element={<Menu />} />
          
          {/* El checkout suele requerir estar en una mesa, 
              pero lo dejamos accesible para que no se rompa el flujo */}
          <Route path="/checkout" element={<Checkout />} />

          {/* 2. ACCESO AL STAFF */}
          <Route path="/login" element={<Login />} />

          {/* 3. RUTAS PROTEGIDAS PARA MOZO Y ADMIN */}
          <Route element={<ProtectedRoute rolesPermitidos={['mozo', 'admin']} />}>
            <Route path="/mozo/panel" element={<PanelMozo />} />
          </Route>

          {/* 4. RUTAS PROTEGIDAS PARA COCINA Y ADMIN */}
          <Route element={<ProtectedRoute rolesPermitidos={['cocina', 'admin']} />}>
            <Route path="/cocina" element={<MonitorCocina />} />
          </Route>

          {/* 5. RUTAS EXCLUSIVAS PARA ADMINISTRADOR */}
          <Route element={<ProtectedRoute rolesPermitidos={['admin']} />}>
            <Route path="/admin/inventario" element={<Inventario />} />
            <Route path="/admin/categorias" element={<GestionCategorias />} />
            <Route path="/admin/usuarios" element={<GestionUsuarios />} />
            <Route path="/admin/mesas" element={<GestionMesas />} />
            <Route path="/admin/caja" element={<CajaPedidos />} />
          </Route>

          {/* REDIRECCIÓN DE SEGURIDAD */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;