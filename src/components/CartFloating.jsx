import { useCart } from '../context/CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function CartFloating() {
  const { cart, total } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Si no hay nada, el botón no estorba
  if (cart.length === 0) return null;

  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="fixed bottom-8 left-0 right-0 px-6 z-50 flex justify-center">
      <button 
        onClick={() => navigate(`/checkout?${searchParams.toString()}`)}
        className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-700 text-white p-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-between items-center hover:scale-[1.05] active:scale-95 transition-all duration-300 group"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/20 group-hover:rotate-12 transition-transform">
              <ShoppingBag size={24} className="text-white" />
            </div>
            <span className="absolute -top-2 -right-2 bg-white text-orange-600 w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-black shadow-md border-2 border-orange-500 animate-pulse">
              {totalItems}
            </span>
          </div>
          <div className="text-left">
            <span className="block text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Tu Pedido</span>
            <span className="text-lg font-black uppercase tracking-tight">Ver Carrito</span>
          </div>
        </div>

        <div className="text-right bg-slate-800/50 px-5 py-2 rounded-2xl border border-slate-700">
          <span className="block text-[10px] text-slate-400 font-black uppercase tracking-widest">Subtotal</span>
          <span className="text-2xl font-black text-orange-500 tracking-tighter">
            S/ {total.toFixed(2)}
          </span>
        </div>
      </button>
    </div>
  );
}