import { useCart } from '../context/CartContext';

export default function ProductCard({ producto, mesaId }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition hover:shadow-lg">
      <img 
        src={producto.imagen_url || 'https://via.placeholder.com/150'} 
        className="h-40 w-full object-cover"
        alt={producto.nombre}
      />
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800">{producto.nombre}</h3>
        <p className="text-gray-50 text-sm mb-2 line-clamp-2">{producto.descripcion}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-orange-600 font-bold text-xl">S/ {producto.precio}</span>
          
          {mesaId ? (
            <button 
              onClick={() => addToCart(producto)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Agregar
            </button>
          ) : (
            <span className="text-xs text-gray-400 italic bg-gray-100 px-2 py-1 rounded">
              Escanea QR para pedir
            </span>
          )}
        </div>
      </div>
    </div>
  );
}