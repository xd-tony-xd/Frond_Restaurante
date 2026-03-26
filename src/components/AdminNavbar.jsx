import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';

export default function AdminNavbar() {
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center px-8">
      <div className="flex gap-6 items-center">
        <span className="font-black text-xl text-orange-500">ADMIN</span>
        <Link to="/admin/inventario" className="hover:text-orange-400 font-bold">Menú</Link>
        <Link to="/admin/mesas" className="hover:text-orange-400 font-bold">Mesas</Link>
        <Link to="/cocina" className="hover:text-orange-400 font-bold">Ver Cocina</Link>
      </div>
      <button onClick={cerrarSesion} className="bg-red-600 px-4 py-2 rounded-xl text-xs font-bold">Cerrar Sesión</button>
    </nav>
  );
}