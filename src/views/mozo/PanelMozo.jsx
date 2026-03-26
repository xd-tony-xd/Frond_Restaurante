import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { CheckCircle2, Clock, Utensils, LogOut, MessageSquare, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PanelMozo() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPedidosMozo();
    const canal = supabase
      .channel('cambios-mozo')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => fetchPedidosMozo())
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, []);

  async function fetchPedidosMozo() {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('id,estado,creado_at,total,notas,mesas(numero_mesa),detalle_pedidos(id,cantidad,productos(nombre))')
        .neq('estado', 'pagado') // Ajustado a tu CHECK de la DB
        .order('creado_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (err) {
      console.error("Error al cargar:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id', id);
      
      if (error) throw error;
      // fetchPedidosMozo(); // Opcional si el realtime está activo
    } catch (err) {
      console.error("Error al actualizar:", err.message);
      alert("Error: El estado '" + nuevoEstado + "' no es válido en la base de datos.");
    }
  };

  if (loading) return <div className="p-10 text-center font-black text-orange-500 italic text-2xl">CARGANDO...</div>;

  return (
    <div className="min-h-screen bg-slate-100 pb-20 font-sans">
      <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Control <span className="text-orange-500">Salón</span></h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Mozo Interactivo</p>
          </div>
          <button 
            onClick={() => navigate('/menu')}
            className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-black text-xs hover:bg-orange-500 transition-all flex items-center gap-2 shadow-lg"
          >
            <Utensils size={16} /> NUEVA ORDEN
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-7">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-[8px] font-black text-orange-500 uppercase">Mesa</span>
                    <span className="text-2xl font-black">{pedido.mesas?.numero_mesa || '??'}</span>
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-black text-lg">Ticket #{String(pedido.id).slice(-3)}</h3>
                    <p className="text-slate-400 font-bold text-[10px] italic flex items-center gap-1 uppercase">
                      <Clock size={12} /> {new Date(pedido.creado_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right font-black">
                  <span className="text-[10px] text-slate-400 uppercase">Total</span>
                  <p className="text-2xl text-slate-900">S/ {pedido.total}</p>
                </div>
              </div>

              <div className="mb-6">
                {pedido.detalle_pedidos?.map(d => (
                  <p key={d.id} className="text-sm font-bold text-slate-600 italic">
                    <span className="text-orange-500">{d.cantidad}x</span> {d.productos?.nombre}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* BOTÓN ENTREGAR */}
                {pedido.estado === 'listo' && (
                  <button 
                    onClick={() => actualizarEstado(pedido.id, 'entregado')}
                    className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-sm uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} /> Marcar como Entregado
                  </button>
                )}

                {/* BOTÓN COBRAR: Ahora usa 'pagado' para coincidir con tu base de datos */}
                {pedido.estado === 'entregado' && (
                  <button 
                    onClick={() => actualizarEstado(pedido.id, 'pagado')}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Banknote size={18} className="text-orange-500" /> Cobrar y Finalizar
                  </button>
                )}

                {(pedido.estado === 'pendiente' || pedido.estado === 'cocina') && (
                  <div className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-100 text-slate-300 font-black text-[10px] uppercase text-center">
                    Pedido en Preparación...
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/login')} className="fixed bottom-6 right-6 bg-white p-4 rounded-full shadow-2xl text-slate-400">
        <LogOut size={24} />
      </button>
    </div>
  );
}