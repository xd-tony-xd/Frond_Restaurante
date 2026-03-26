import { createContext, useContext, useState } from 'react';
import { supabase } from '../api/supabase';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Añadir al carrito (si ya existe, suma 1)
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  // NUEVA: Actualizar cantidad manualmente (+ o -)
  const updateQuantity = (id, amount) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.cantidad + amount;
          return { ...item, cantidad: newQty > 0 ? newQty : 1 }; // Mínimo 1
        }
        return item;
      })
    );
  };

  // Eliminar un producto específico
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Limpiar todo el carrito
  const clearCart = () => setCart([]);

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // Enviar a Supabase (usando el número de mesa)
  const enviarPedido = async (numeroMesa, notas = "") => {
    try {
      if (cart.length === 0) return { error: "Carrito vacío" };

      const articulos = cart.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio
      }));

      const { data, error } = await supabase.rpc('crear_pedido_completo', {
        p_numero_mesa: parseInt(numeroMesa),
        p_total: total,
        p_notas: notas,
        p_articulos: articulos
      });

      if (error) throw error;
      clearCart();
      return { success: true, pedidoId: data };
    } catch (error) {
      return { error: error.message };
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      updateQuantity, // <-- Para los botones + y -
      removeFromCart, 
      clearCart, 
      total, 
      enviarPedido 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);