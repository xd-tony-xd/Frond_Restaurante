import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import ProductCard from '../../components/ProductCard';
import CartFloating from '../../components/CartFloating';

export default function Menu() {
  const [productos, setProductos] = useState([]);
  const [searchParams] = useSearchParams();
  const mesaId = searchParams.get('mesa'); // Captura ?mesa=1

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .eq('disponible', true);
    setProductos(data || []);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white p-6 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
          Nuestra Carta
        </h1>
        {mesaId ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-sm font-bold text-green-600">Mesa {mesaId} activa</p>
          </div>
        ) : (
          <p className="text-xs text-orange-500 font-medium mt-1">
            Modo visualización (Sin mesa)
          </p>
        )}
      </header>

      <main className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productos.map((prod) => (
          <ProductCard key={prod.id} producto={prod} mesaId={mesaId} />
        ))}
      </main>

      {mesaId && <CartFloating />}
    </div>
  );
}