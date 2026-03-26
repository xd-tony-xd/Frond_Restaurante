import { useCart } from '../../context/CartContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { useState } from 'react';
import { Trash2, Plus, Minus, ArrowLeft, Eraser } from 'lucide-react';

export default function Checkout() {

  const { cart, total, clearCart, updateQuantity, removeFromCart } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);

  const mesaId = searchParams.get('mesa');

  const procesarPedido = async () => {

    if (cart.length === 0) return;

    setEnviando(true);

    // VALIDAR QUE LA MESA ESTÉ ACTIVA
    const { data: mesa, error: mesaError } = await supabase
      .from("mesas")
      .select("*")
      .eq("numero_mesa", parseInt(mesaId))
      .eq("activo", true)
      .single();

    if (mesaError || !mesa) {
      alert("⚠ Esta mesa no está disponible");
      setEnviando(false);
      return;
    }

    const { error } = await supabase.rpc('crear_pedido_completo', {
      p_numero_mesa: parseInt(mesaId),
      p_total: total,
      p_notas: "Pedido desde mesa",
      p_articulos: cart.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio
      }))
    });

    if (!error) {

      alert("¡Pedido enviado con éxito!");

      clearCart();

      navigate(`/menu?mesa=${mesaId}`);

    } else {

      alert("Hubo un error: " + error.message);

    }

    setEnviando(false);

  };

  if (cart.length === 0) {

    return (

      <div className="p-10 text-center min-h-screen flex flex-col items-center justify-center bg-gray-50">

        <h2 className="text-2xl font-black mb-4 uppercase text-gray-400 tracking-tighter">
          Carrito Vacío
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black uppercase shadow-lg"
        >
          VOLVER A LA CARTA
        </button>

      </div>

    );

  }

  return (

    <div className="p-6 max-w-lg mx-auto bg-white min-h-screen relative shadow-2xl">

      <div className="flex justify-between items-center mb-8">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-orange-500 font-black uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={18}/> Volver
        </button>

        <button
          onClick={() => {
            if(window.confirm("¿Vaciar todo el carrito?")) clearCart()
          }}
          className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors font-bold text-[10px] uppercase tracking-widest"
        >
          <Eraser size={14}/> Limpiar Carrito
        </button>

      </div>

      <h1 className="text-4xl font-black mb-10 tracking-tighter italic uppercase">
        Tu <span className="text-orange-500">Pedido</span>
      </h1>

      <div className="space-y-6 mb-32">

        {cart.map(item => (

          <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-6">

            <div className="flex-1">

              <p className="font-black text-xl uppercase">
                {item.nombre}
              </p>

              <p className="text-gray-400 font-bold text-sm">
                S/ {item.precio.toFixed(2)} unit.
              </p>

            </div>

            <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-2xl border border-gray-200">

              <div className="flex items-center gap-3 px-1">

                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center"
                >
                  <Minus size={16}/>
                </button>

                <span className="font-black text-xl w-6 text-center">
                  {item.cantidad}
                </span>

                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center"
                >
                  <Plus size={16}/>
                </button>

              </div>

              <div className="w-[1px] h-8 bg-gray-300"></div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-gray-300 hover:text-red-600"
              >
                <Trash2 size={22}/>
              </button>

            </div>

          </div>

        ))}

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t max-w-lg mx-auto">

        <div className="flex justify-between items-center mb-4 px-2">

          <span className="text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]">
            Total estimado
          </span>

          <span className="text-4xl font-black text-gray-900">
            S/ {total.toFixed(2)}
          </span>

        </div>

        <button
          disabled={enviando}
          onClick={procesarPedido}
          className="w-full bg-orange-500 text-white py-6 rounded-[2rem] font-black text-2xl disabled:opacity-50"
        >
          {enviando ? "ENVIANDO..." : "¡CONFIRMAR PEDIDO!"}
        </button>

      </div>

    </div>

  );

}