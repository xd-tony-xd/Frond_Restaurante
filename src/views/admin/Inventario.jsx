import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Plus, Pencil, Trash2, X, Save, UtensilsCrossed } from 'lucide-react';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: '', 
    categoria_id: '', imagen_url: '', disponible: true 
  });

  useEffect(() => { fetchDatos(); }, []);

  async function fetchDatos() {
    const { data: p } = await supabase.from('productos').select('*, categorias(nombre)');
    const { data: c } = await supabase.from('categorias').select('*');
    setProductos(p || []);
    setCategorias(c || []);
  }

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (editandoId) {
      await supabase.from('productos').update(form).eq('id', editandoId);
    } else {
      await supabase.from('productos').insert([form]);
    }
    resetForm();
    fetchDatos();
  };

  const prepararEdicion = (p) => {
    setForm({ 
      nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, 
      categoria_id: p.categoria_id, imagen_url: p.imagen_url, disponible: p.disponible 
    });
    setEditandoId(p.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ nombre: '', descripcion: '', precio: '', categoria_id: '', imagen_url: '', disponible: true });
    setEditandoId(null);
    setShowForm(false);
  };

  const eliminar = async (id) => {
    if (confirm("¿Eliminar este producto?")) {
      await supabase.from('productos').delete().eq('id', id);
      fetchDatos();
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black tracking-tighter">MENÚ / PLATOS</h1>
        <button 
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${showForm ? 'bg-gray-200 text-gray-700' : 'bg-orange-500 text-white shadow-lg hover:bg-orange-600'}`}
        >
          {showForm ? <X size={20}/> : <><Plus size={20}/> Nuevo Plato</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleGuardar} className="bg-white p-6 rounded-3xl shadow-xl mb-10 border border-orange-100 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Nombre del Plato</label>
              <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Precio (S/)</label>
              <input type="number" step="0.01" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-gray-400 uppercase">Descripción Detallada</label>
              <textarea className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" rows="2" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Categoría</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold" value={form.categoria_id} onChange={e => setForm({...form, categoria_id: e.target.value})} required>
                <option value="">Seleccionar...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase">URL Imagen (Link)</label>
              <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" value={form.imagen_url} onChange={e => setForm({...form, imagen_url: e.target.value})} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-5 h-5 accent-orange-500" checked={form.disponible} onChange={e => setForm({...form, disponible: e.target.checked})} />
              <label className="font-bold text-gray-700">Disponible para la venta</label>
            </div>
          </div>
          <button className="mt-8 bg-gray-900 text-white px-12 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-orange-500 transition-all">
            <Save size={20}/> {editandoId ? 'ACTUALIZAR PLATO' : 'CREAR PLATO'}
          </button>
        </form>
      )}

      {/* Tabla Responsiva */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-900 text-white text-xs uppercase font-black">
              <tr>
                <th className="p-5">Plato</th>
                <th className="p-5">Categoría</th>
                <th className="p-5">Precio</th>
                <th className="p-5">Estado</th>
                <th className="p-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {productos.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5 flex items-center gap-4">
                    <img src={p.imagen_url || 'https://via.placeholder.com/150'} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                    <div>
                      <p className="font-bold text-gray-900">{p.nombre}</p>
                      <p className="text-[10px] text-gray-400 truncate w-40">{p.descripcion}</p>
                    </div>
                  </td>
                  <td className="p-5"><span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full">{p.categorias?.nombre}</span></td>
                  <td className="p-5 font-black text-orange-600 underline">S/ {p.precio}</td>
                  <td className="p-5">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md ${p.disponible ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {p.disponible ? 'DISPONIBLE' : 'AGOTADO'}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex gap-2">
                      <button onClick={() => prepararEdicion(p)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Pencil size={16}/></button>
                      <button onClick={() => eliminar(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}