import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminSidebar from './AdminSidebar';

const ProtectedRoute = ({ rolesPermitidos }) => {
  const { profile, loading } = useAuth();

  if (loading) return null;

  if (!profile || !rolesPermitidos.includes(profile.rol)) {
    return <Navigate to="/login" replace />;
  }

  // ESTRUCTURA PARA ADMINISTRADOR (Con Sidebar)
  if (profile.rol === 'admin') {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 w-full">
          <Outlet />
        </main>
      </div>
    );
  }

  // ESTRUCTURA PARA MOZO Y COCINA (Pantalla completa)
  return (
    <div className="min-h-screen w-full">
      <Outlet />
    </div>
  );
};

export default ProtectedRoute;