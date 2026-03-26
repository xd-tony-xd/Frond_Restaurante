import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { CheckCircle2, Clock, Zap } from 'lucide-react';

export default function MonitorBase() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetchPedidos();
    const canal = supabase.channel('cambios-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => fetchPedidos())
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, []);

  async function fetchPedidos() {
    const { data } = await supabase
      .from('pedidos')
      .select(`id, estado, creado_at, notas, mesas ( numero_mesa ), detalle_pedidos ( cantidad, productos ( nombre ) )`)
      .in('estado', ['pendiente', 'cocina'])
      .order('creado_at', { ascending: true });
    setPedidos(data || []);
  }

  const cambiarEstado = async (id, estadoActual) => {
    const nuevo = estadoActual === 'pendiente' ? 'cocina' : 'listo';
    await supabase.from('pedidos').update({ estado: nuevo }).eq('id', id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {pedidos.map((pedido) => (
        <div key={pedido.id} className={`aspect-square bg-white rounded-[3rem] shadow-2xl flex flex-col border-t-[16px] overflow-hidden ${pedido.estado === 'pendiente' ? 'border-orange-500' : 'border-blue-600'}`}>
          <div className="p-6 bg-slate-50 border-b-2 border-dashed border-slate-200 flex justify-between items-center shrink-0">
            <div className="bg-slate-900 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 border-slate-700">
              <span className="text-[9px] font-black uppercase text-orange-500">MESA</span>
              <span className="text-3xl font-black">{pedido.mesas?.numero_mesa || '?'}</span>
            </div>
            <div className="text-right">
              <p className="text-slate-900 font-black text-2xl italic uppercase">#{String(pedido.id).slice(-3)}</p>
              <div className="flex items-center justify-end gap-1 text-slate-400 font-bold text-[11px] mt-2 uppercase">
                <Clock size={14} /> {new Date(pedido.creado_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          <div className="p-7 flex-grow overflow-y-auto">
            {pedido.detalle_pedidos?.map((d, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-slate-50 pb-3 mb-3 last:border-0">
                <span className="bg-slate-900 text-orange-500 w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg">{d.cantidad}</span>
                <p className="font-black text-slate-800 uppercase text-xl tracking-tighter leading-none">{d.productos?.nombre}</p>
              </div>
            ))}
          </div>
          <div className="p-6 pt-0">
            <button onClick={() => cambiarEstado(pedido.id, pedido.estado)} className={`w-full py-5 rounded-[1.5rem] font-black text-2xl flex items-center justify-center gap-4 uppercase transition-all active:scale-95 ${pedido.estado === 'pendiente' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'}`}>
              {pedido.estado === 'pendiente' ? <><Zap size={24}/> MARCHAR</> : <><CheckCircle2 size={26}/> DESPACHAR</>}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}