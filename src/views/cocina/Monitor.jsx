import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { CheckCircle2, Clock, ChefHat, Zap, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MonitorCocina() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPedidosPendientes();
    const canal = supabase
      .channel('cambios-pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => fetchPedidosPendientes())
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, []);

  async function fetchPedidosPendientes() {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`id, estado, creado_at, notas, mesas ( numero_mesa ), detalle_pedidos ( cantidad, productos ( nombre ) )`)
        .in('estado', ['pendiente', 'cocina'])
        .order('creado_at', { ascending: true });
      if (error) throw error;
      setPedidos(data || []);
    } catch (err) { console.error(err.message); } finally { setLoading(false); }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    if (nuevoEstado === 'listo') setPedidos(prev => prev.filter(p => p.id !== pedidoId));
    const { error } = await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', pedidoId);
    if (!error && nuevoEstado === 'cocina') fetchPedidosPendientes();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-black text-orange-500 uppercase tracking-widest animate-pulse">
      INICIANDO KITCHEN CORE...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] p-6 font-sans">
      
      {/* HEADER PROFESIONAL */}
      <div className="max-w-[1400px] mx-auto flex justify-between items-center mb-8 bg-[#0f172a] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="bg-orange-600 p-4 rounded-3xl shadow-lg shadow-orange-900/40">
            <ChefHat size={38} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
              KITCHEN <span className="text-orange-500">CORE</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] tracking-[0.4em] uppercase mt-2 italic">STARTRAINING AYACUCHO</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-slate-900 px-8 py-4 rounded-2xl flex items-center gap-5 border border-slate-800 shadow-inner">
             <span className="text-4xl font-black text-white leading-none">{pedidos.length}</span>
             <Bell className="text-orange-500 animate-bounce" size={28} />
          </div>
          
          <button 
            onClick={handleLogout}
            className="bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-900/40 p-5 rounded-2xl transition-all active:scale-90 shadow-lg"
          >
            <LogOut size={28} />
          </button>
        </div>
      </div>

      {/* GRID DE 3 COLUMNAS - CUADRADOS */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pedidos.length === 0 && (
          <div className="col-span-full py-40 text-center opacity-20">
            <p className="text-white font-black text-4xl uppercase italic tracking-widest">Cocina Despejada</p>
          </div>
        )}

        {pedidos.map((pedido) => (
          <div 
            key={pedido.id} 
            className={`aspect-square bg-white rounded-[3rem] shadow-2xl flex flex-col border-t-[16px] transition-transform duration-300 hover:scale-[1.01] relative overflow-hidden ${
              pedido.estado === 'pendiente' ? 'border-orange-500' : 'border-blue-600'
            }`}
          >
            {/* CABECERA: Mesa y Ticket */}
            <div className="p-6 bg-slate-50 border-b-2 border-dashed border-slate-200 flex justify-between items-center shrink-0">
              <div className="bg-slate-900 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 border-slate-700">
                <span className="text-[9px] font-black uppercase text-orange-500 leading-none">MESA</span>
                <span className="text-3xl font-black leading-none">{pedido.mesas?.numero_mesa || '?'}</span>
              </div>
              <div className="text-right">
                <p className="text-slate-900 font-black text-2xl leading-none italic uppercase">#{String(pedido.id).slice(-3)}</p>
                <div className="flex items-center justify-end gap-1 text-slate-400 font-bold text-[11px] mt-2 uppercase">
                  <Clock size={14} /> {new Date(pedido.creado_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* CONTENIDO: Scrollable si hay muchos items */}
            <div className="p-7 flex-grow overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                {pedido.detalle_pedidos?.map((detalle, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-slate-50 pb-3 last:border-0">
                    <span className="bg-slate-900 text-orange-500 w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                      {detalle.cantidad}
                    </span>
                    <p className="font-black text-slate-800 uppercase text-xl tracking-tighter leading-none">
                      {detalle.productos?.nombre}
                    </p>
                  </div>
                ))}
              </div>

              {pedido.notas && (
                <div className="mt-6 p-4 bg-orange-50 rounded-2xl border-l-8 border-orange-500 text-orange-950 font-black italic text-xs leading-tight shadow-sm uppercase">
                  "{pedido.notas}"
                </div>
              )}
            </div>

            {/* ACCIÓN: Botón Grande */}
            <div className="p-6 pt-0 shrink-0">
              <button 
                onClick={() => cambiarEstado(pedido.id, pedido.estado === 'pendiente' ? 'cocina' : 'listo')}
                className={`w-full py-5 rounded-[1.5rem] font-black text-2xl flex items-center justify-center gap-4 uppercase tracking-tighter shadow-xl transition-all active:scale-95 ${
                  pedido.estado === 'pendiente' 
                  ? 'bg-slate-900 text-white hover:bg-orange-600' 
                  : 'bg-blue-600 text-white hover:bg-green-600'
                }`}
              >
                {pedido.estado === 'pendiente' ? (
                  <><Zap size={24} fill="currentColor"/> MARCHAR</>
                ) : (
                  <><CheckCircle2 size={26}/> DESPACHAR</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
      `}</style>
    </div>
  );
}