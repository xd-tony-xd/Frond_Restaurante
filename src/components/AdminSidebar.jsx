import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../api/supabase';
// Cambiamos Cookpot por ChefHat para evitar el error de exportación
import { LayoutDashboard, Utensils, Users, Smartphone, LogOut, Menu, X, Tags, ChefHat } from 'lucide-react';

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [rol, setRol] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    obtenerRol();
  }, []);

  async function obtenerRol() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single();
      setRol(data?.rol);
    }
  }

  // Lista de items con ChefHat en lugar de Cookpot
  const menuItems = [
    { name: 'Monitor Cocina', path: '/cocina', icon: <ChefHat size={20}/>, roles: ['admin', 'cocina'] },
    { name: 'Caja y Ventas', path: '/admin/caja', icon: <LayoutDashboard size={20}/>, roles: ['admin'] },
    { name: 'Productos', path: '/admin/inventario', icon: <Utensils size={20}/>, roles: ['admin'] },
    { name: 'Categorías', path: '/admin/categorias', icon: <Tags size={20}/>, roles: ['admin'] },
    { name: 'Personal', path: '/admin/usuarios', icon: <Users size={20}/>, roles: ['admin'] },
    { name: 'Mesas / QR', path: '/admin/mesas', icon: <Smartphone size={20}/>, roles: ['admin'] },
  ];

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-800';

  return (
    <>
      {/* Botón Móvil */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-gray-900 transition-all duration-300 z-40 ${isOpen ? 'w-64' : 'w-0 lg:w-64'} border-r border-gray-800 overflow-hidden`}>
        <div className="p-6">
          <h1 className="text-2xl font-black text-orange-500 tracking-tighter mb-10">MARIOS RESTAURANTE</h1>
          
          <nav className="space-y-2">
            {menuItems
              .filter(item => rol && item.roles.includes(rol)) // Filtramos solo si ya tenemos el rol
              .map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${isActive(item.path)}`}
                >
                  {item.icon}
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6 space-y-4">
          {/* Indicador de Rol */}
          <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
            <p className="text-[10px] font-black text-gray-500 uppercase">Perfil</p>
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              {rol ? rol : 'Cargando...'}
            </p>
          </div>

          <button 
            onClick={cerrarSesion} 
            className="w-full flex items-center gap-4 p-4 text-red-400 font-bold hover:bg-red-500/10 rounded-2xl transition-all"
          >
            <LogOut size={20}/> <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}