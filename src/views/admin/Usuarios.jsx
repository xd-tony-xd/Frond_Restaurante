import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { UserPlus, Trash2, ShieldCheck, Mail, User } from 'lucide-react';

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nuevo, setNuevo] = useState({ id: '', nombre: '', rol: 'mozo' });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  async function fetchUsuarios() {
    const { data } = await supabase.from('perfiles').select('*').order('creado_at');
    setUsuarios(data || []);
  }

  const guardarUsuario = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('perfiles').upsert([nuevo]);
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      setNuevo({ id: '', nombre: '', rol: 'mozo' });
      setShowForm(false);
      fetchUsuarios();
    }
    setLoading(false);
  };

  const eliminarPerfil = async (id) => {
    if (confirm("¿Seguro que deseas eliminar este perfil del sistema?")) {
      await supabase.from('perfiles').delete().eq('id', id);
      fetchUsuarios();
    }
  };

  return (
    /* He quitado lg:ml-64 para evitar el doble margen */
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Personal <span className="text-orange-500">Core</span></h1>
          <p className="text-gray-500 font-medium">Gestiona los accesos de Mozos y Cocina</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold shadow-lg transition-all ${showForm ? 'bg-gray-200 text-gray-700' : 'bg-gray-900 text-white hover:bg-orange-500'}`}
        >
          {showForm ? 'Cancelar' : <><UserPlus size={20}/> Agregar Personal</>}
        </button>
      </div>

      {/* Formulario Acordeón */}
      {showForm && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 mb-10 animate-in slide-in-from-top duration-300">
          <form onSubmit={guardarUsuario} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">ID de Usuario (UUID de Supabase)</label>
              <input 
                type="text" 
                required
                placeholder="Pega el UUID aquí..."
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                value={nuevo.id}
                onChange={e => setNuevo({...nuevo, id: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Nombre Completo</label>
              <input 
                type="text" 
                required
                placeholder="Ej: Juan Perez"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                value={nuevo.nombre}
                onChange={e => setNuevo({...nuevo, nombre: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Rol en el Sistema</label>
              <select 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-700"
                value={nuevo.rol}
                onChange={e => setNuevo({...nuevo, rol: e.target.value})}
              >
                <option value="mozo">Mozo (Pedidos)</option>
                <option value="cocina">Cocina (Monitor)</option>
                <option value="admin">Administrador (Todo)</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <button 
                disabled={loading}
                className="w-full md:w-auto bg-orange-500 text-white px-12 py-4 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? "GUARDANDO..." : "VINCULAR MIEMBRO"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de Usuarios Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {usuarios.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${user.rol === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                {user.rol === 'admin' ? <ShieldCheck size={28}/> : <User size={28}/>}
              </div>
              <div>
                <h3 className="font-black text-gray-800 text-lg uppercase tracking-tight">{user.nombre}</h3>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${user.rol === 'admin' ? 'bg-orange-500 text-white' : 'bg-gray-900 text-white'}`}>
                  {user.rol}
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center border-t pt-4 border-gray-50">
              <div className="text-[10px] text-gray-400 font-bold">
                ID: {user.id.substring(0, 8)}...
              </div>
              <button 
                onClick={() => eliminarPerfil(user.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}