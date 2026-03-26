import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Plus, Trash2, Image as ImageIcon, Pencil, X, Save, CheckCircle2, XCircle } from 'lucide-react';

export default function GestionCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estado inicial del formulario con todos los atributos de tu BD
  const [form, setForm] = useState({
    nombre: '',
    imagen_url: '',
    activo: true
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    const { data } = await supabase.from('categorias').select('*').order('id');
    setCategorias(data || []);
  }

  const handleGuardar = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editandoId) {
      // ACTUALIZAR
      const { error } = await supabase
        .from('categorias')
        .update(form)
        .eq('id', editandoId);
      if (error) alert(error.message);
    } else {
      // CREAR NUEVO
      const { error } = await supabase
        .from('categorias')
        .insert([form]);
      if (error) alert(error.message);
    }

    setLoading(false);
    resetForm();
    fetchCategorias();
  };

  const prepararEdicion = (cat) => {
    setForm({
      nombre: cat.nombre,
      imagen_url: cat.imagen_url || '',
      activo: cat.activo
    });
    setEditandoId(cat.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ nombre: '', imagen_url: '', activo: true });
    setEditandoId(null);
    setShowForm(false);
  };

  const eliminar = async (id) => {
    if (confirm("¿Eliminar categoría? Los productos vinculados podrían dar error.")) {
      const { error } = await supabase.from('categorias').delete().eq('id', id);
      if (error) alert("No se puede eliminar: tiene productos asociados.");
      fetchCategorias();
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">CATEGORÍAS</h1>
          <p className="text-gray-500 text-sm font-bold">Organiza el menú de Resturante-Marios</p>
        </div>
        <button 
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold shadow-lg transition-all ${
            showForm ? 'bg-gray-200 text-gray-700' : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {showForm ? <X size={20}/> : <><Plus size={20}/> Nueva Categoría</>}
        </button>
      </div>

      {/* FORMULARIO ACORDEÓN (EDITAR / CREAR) */}
      {showForm && (
        <form onSubmit={handleGuardar} className="bg-white p-6 rounded-3xl shadow-xl mb-10 border border-orange-100 animate-in slide-in-from-top duration-300">
          <h2 className="text-lg font-black mb-4 text-orange-600">
            {editandoId ? 'EDITAR CATEGORÍA' : 'DATOS DE CATEGORÍA'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Nombre de Categoría</label>
              <input 
                type="text" 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
                placeholder="Ej: Platos de Fondo"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">URL de Imagen (Opcional)</label>
              <input 
                type="text" 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                value={form.imagen_url}
                onChange={e => setForm({...form, imagen_url: e.target.value})}
                placeholder="https://link-de-la-foto.com"
              />
            </div>
            <div className="flex items-center gap-3 p-2">
              <input 
                type="checkbox" 
                id="activo"
                className="w-6 h-6 accent-orange-500 cursor-pointer"
                checked={form.activo}
                onChange={e => setForm({...form, activo: e.target.checked})}
              />
              <label htmlFor="activo" className="font-bold text-gray-700 cursor-pointer">Categoría Activa (Visible al cliente)</label>
            </div>
          </div>
          
          <div className="mt-8 flex gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-orange-500 transition-all disabled:opacity-50"
            >
              <Save size={20}/> {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
            </button>
            <button 
              type="button"
              onClick={resetForm}
              className="bg-gray-100 text-gray-500 px-6 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* LISTADO TIPO CARDS RESPONSIVO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map(cat => (
          <div key={cat.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center overflow-hidden border border-orange-100">
                {cat.imagen_url ? (
                  <img src={cat.imagen_url} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-orange-300" size={30} />
                )}
              </div>
              <div>
                <h3 className="font-black text-gray-800 uppercase tracking-tight">{cat.nombre}</h3>
                <div className="flex items-center gap-1">
                  {cat.activo ? (
                    <span className="flex items-center text-[10px] font-bold text-green-500 italic"><CheckCircle2 size={10} className="mr-1"/> En línea</span>
                  ) : (
                    <span className="flex items-center text-[10px] font-bold text-red-400 italic"><XCircle size={10} className="mr-1"/> Oculto</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              <button 
                onClick={() => prepararEdicion(cat)}
                className="p-3 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => eliminar(cat.id)} 
                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}