import { useState } from 'react';
import { supabase } from '../../api/supabase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Autenticación con Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Consultar el rol en la tabla 'perfiles'
      const { data: profile, error: profileError } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      // 3. REDIRECCIÓN POR ROL
      // Es vital que el nombre del rol coincida exactamente con tu base de datos
      if (profile?.rol === 'admin') {
        navigate('/admin/inventario');
      } else if (profile?.rol === 'cocina') {
        navigate('/cocina');
      } else if (profile?.rol === 'mozo') {
        navigate('/mozo/panel'); // <--- Redirección corregida para el Mozo
      } else {
        navigate('/menu'); // Fallback para clientes o roles no definidos
      }

    } catch (error) {
      alert("Error de acceso: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">STARTRAINING</h1>
          <p className="text-gray-400 font-medium italic">SISTEMA DE GESTIÓN</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2 ml-1">Email Corporativo</label>
            <input 
              type="email" 
              required
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              placeholder="correo@ejemplo.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2 ml-1">Contraseña</label>
            <input 
              type="password" 
              required
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-500 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? "VALIDANDO..." : "ENTRAR AL SISTEMA"}
          </button>
        </form>
      </div>
    </div>
  );
}