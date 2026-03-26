import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { DollarSign, Utensils, CreditCard, Clock, CheckCircle, Hash } from 'lucide-react';

export default function CajaPedidos() {
  const [pedidosActivos, setPedidosActivos] = useState([]);

  useEffect(() => {
    fetchPedidos();
    
    // Suscripción Realtime para actualizar la caja si cocina termina un plato
    const canalCaja = supabase
      .channel('cambios-caja')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        fetchPedidos();
      })
      .subscribe();

    return () => supabase.removeChannel(canalCaja);
  }, []);

  async function fetchPedidos() {
    const { data } = await supabase
      .from('pedidos')
      .select('*, mesas(numero_mesa)')
      .neq('estado', 'pagado')
      .order('creado_at', { ascending: false });
    setPedidosActivos(data || []);
  }

  const cobrarYLibear = async (pedidoId, mesaId) => {
    if (confirm("¿Confirmar pago y liberar mesa?")) {
      // 1. Marcar como pagado
      await supabase.from('pedidos').update({ estado: 'pagado' }).eq('id', pedidoId);
      // 2. Liberar la mesa físicamente
      await supabase.from('mesas').update({ estado: 'libre' }).eq('id', mesaId);
      fetchPedidos();
    }
  };

  const marcarEntregado = async (id) => {
    await supabase.from('pedidos').update({ estado: 'entregado' }).eq('id', id);
    fetchPedidos();
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">CONTROL DE CAJA</h1>
        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Gestión de Cuentas y Salón</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pedidosActivos.map(p => (
          <div key={p.id} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-dashed border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <span className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase mb-1">
                  <Hash size={12}/> Pedido {p.id}
                </span>
                <h2 className="text-3xl font-black text-gray-800">MESA {p.mesas?.numero_mesa}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-400 uppercase">Total</p>
                <p className="text-2xl font-black text-orange-600">S/ {p.total}</p>
              </div>
            </div>

            <div className="p-6 flex-grow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                  <Clock size={16}/> 
                  {new Date(p.creado_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                  p.estado === 'listo' ? 'bg-green-500 text-white animate-bounce' : 'bg-orange-100 text-orange-600'
                }`}>
                  {p.estado}
                </span>
              </div>
              
              {p.notas && (
                <p className="text-xs bg-blue-50 p-3 rounded-xl text-blue-700 font-medium">
                  "{p.notas}"
                </p>
              )}
            </div>

            <div className="p-6 bg-gray-50 grid grid-cols-1 gap-3">
              {p.estado === 'listo' && (
                <button 
                  onClick={() => marcarEntregado(p.id)}
                  className="bg-blue-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  <Utensils size={18}/> MARCAR COMO ENTREGADO
                </button>
              )}
              
              <button 
                onClick={() => cobrarYLibear(p.id, p.mesa_id)}
                className="bg-gray-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg"
              >
                <DollarSign size={18}/> COBRAR Y FINALIZAR
              </button>
            </div>
          </div>
        ))}

        {pedidosActivos.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
            <CheckCircle size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest">No hay cuentas pendientes</p>
          </div>
        )}
      </div>
    </div>
  );
}