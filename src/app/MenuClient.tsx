'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  display_order: number;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  name_es: string | null;
  description: string | null;
  description_es: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  display_order: number;
}

interface MenuClientProps {
  categories: Category[];
  menuItems: MenuItem[];
}

export default function MenuClient({ categories, menuItems }: MenuClientProps) {
  // Cart state: { itemId: quantity }
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Helper to add item to cart
  const addToCart = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  // Helper to remove item / decrease quantity
  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id] <= 1) {
        delete newCart[id];
      } else {
        newCart[id] -= 1;
      }
      return newCart;
    });
  };

  // Calculate cart stats
  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartSubtotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return total;
    // Price from database can sometimes come as a string from pg numeric, so parse it
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return total + price * qty;
  }, 0);

  // Get details of items in the cart
  const cartDetails = Object.entries(cart).map(([id, qty]) => {
    const item = menuItems.find((m) => m.id === id)!;
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return {
      item,
      quantity: qty,
      totalPrice: price * qty,
    };
  });

  return (
    <>
      <div className="menu-content">
        {categories.map((category) => {
          const itemsInCategory = menuItems.filter(
            (item) => item.category_id === category.id
          );
          if (itemsInCategory.length === 0) return null;

          return (
            <section key={category.id} className="category-section">
              <h2 className="category-title">{category.name}</h2>
              <div className="items-grid">
                {itemsInCategory.map((item) => {
                  const qty = cart[item.id] || 0;
                  const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                  
                  return (
                    <div key={item.id} className="menu-item-card">
                      <div className="menu-item-body">
                        <div className="menu-item-info">
                          <div className="menu-item-header">
                            <h3 className="item-name">{item.name}</h3>
                            <span className="item-price">${price.toFixed(2)}</span>
                          </div>
                          {item.name_es && item.name_es !== item.name && (
                            <p className="item-name-es">{item.name_es}</p>
                          )}
                          <p className="item-description">{item.description}</p>
                        </div>
                        
                        {item.image_url && (
                          <div className="menu-item-image-container">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 90px, 120px"
                              className="menu-item-image"
                            />
                          </div>
                        )}
                      </div>

                      <div className="menu-item-actions">
                        {qty === 0 ? (
                          <button
                            className="add-to-cart-btn"
                            onClick={() => addToCart(item.id)}
                          >
                            Agregar al carrito
                          </button>
                        ) : (
                          <div className="quantity-selector">
                            <button
                              className="qty-btn minus"
                              onClick={() => removeFromCart(item.id)}
                            >
                              −
                            </button>
                            <span className="qty-value">{qty}</span>
                            <button
                              className="qty-btn plus"
                              onClick={() => addToCart(item.id)}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Floating Cart Button at bottom */}
      {cartItemsCount > 0 && (
        <div className="floating-cart-bar-container">
          <button 
            className="floating-cart-bar" 
            onClick={() => setIsCartOpen(true)}
          >
            <div className="cart-bar-left">
              <span className="cart-badge">{cartItemsCount}</span>
              <span className="cart-bar-label">Ver mi orden</span>
            </div>
            <span className="cart-bar-total">${cartSubtotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Cart Modal / Slide-up Drawer */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div 
            className="cart-drawer" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-drawer-header">
              <h2>Mi Orden</h2>
              <button 
                className="close-drawer-btn" 
                onClick={() => setIsCartOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="cart-drawer-content">
              {cartDetails.length === 0 ? (
                <div className="empty-cart">
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartDetails.map(({ item, quantity, totalPrice }) => {
                    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                    return (
                      <div key={item.id} className="cart-item-row">
                        {item.image_url && (
                          <div className="cart-item-img-thumb">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              width={50}
                              height={50}
                              className="cart-item-thumb"
                            />
                          </div>
                        )}
                        <div className="cart-item-details">
                          <h4 className="cart-item-name">{item.name}</h4>
                          <span className="cart-item-price-unit">${price.toFixed(2)} c/u</span>
                        </div>
                        <div className="cart-item-qty-actions">
                          <button
                            className="cart-qty-btn"
                            onClick={() => removeFromCart(item.id)}
                          >
                            −
                          </button>
                          <span className="cart-qty-val">{quantity}</span>
                          <button
                            className="cart-qty-btn"
                            onClick={() => addToCart(item.id)}
                          >
                            +
                          </button>
                        </div>
                        <span className="cart-item-total">${totalPrice.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cartItemsCount > 0 && (
              <div className="cart-drawer-footer">
                <div className="subtotal-row">
                  <span>Subtotal</span>
                  <span className="subtotal-amount">${cartSubtotal.toFixed(2)}</span>
                </div>
                <button 
                  className="checkout-btn"
                  onClick={() => alert('¡Próximamente! Integrando Square pagos...')}
                >
                  Pagar con Tarjeta
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
