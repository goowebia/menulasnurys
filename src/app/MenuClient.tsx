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

interface CartItem {
  id: string; // Unique key representing: itemId + "-" + sorted_options
  item: MenuItem;
  quantity: number;
  selectedOptions: { [optionTitle: string]: string };
}

interface MenuClientProps {
  categories: Category[];
  menuItems: MenuItem[];
}

export default function MenuClient({ categories, menuItems }: MenuClientProps) {
  // Cart state: CartItem[]
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Customization modal state
  const [activeOptionsItem, setActiveOptionsItem] = useState<MenuItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Customization definitions matched by ID or Name (for robustness)
  const getCustomizations = (item: MenuItem) => {
    const nameLower = item.name.toLowerCase();
    if (nameLower.includes('sopes') || item.id === 'bf5fc29d-5af7-4af7-97d5-eb3d22ac8d06') {
      return [
        {
          title: 'Choose Protein',
          required: true,
          choices: ['Asada (Steak)', 'Adobada (Marinated Pork)', 'Shrimp', 'Vegetarian', 'Surf & Turf']
        }
      ];
    }
    if (nameLower.includes('street tacos') || item.id === '1cabbcd0-134b-4e1f-8f58-247eebd3d859') {
      return [
        {
          title: 'Choose Protein',
          required: true,
          choices: ['Asada (Steak)', 'Adobada (Marinated Pork)']
        }
      ];
    }
    if (nameLower.includes('quesadilla') || item.id === '45511459-42f4-4ad8-ae55-e9749ec3a674') {
      return [
        {
          title: 'Choose Protein',
          required: true,
          choices: ['Asada (Steak)', 'Adobada (Marinated Pork)', 'Shrimp']
        },
        {
          title: 'Choose Tortilla Type',
          required: true,
          choices: ['Handmade Corn Tortilla', 'Flour Tortilla']
        }
      ];
    }
    return null;
  };

  // Helper to get total quantity of a specific item in the cart (across all variants)
  const getItemQtyInCart = (itemId: string) => {
    return cart
      .filter((cartItem) => cartItem.item.id === itemId)
      .reduce((sum, cartItem) => sum + cartItem.quantity, 0);
  };

  // Trigger add item flow
  const handleAddItemClick = (item: MenuItem) => {
    const customizations = getCustomizations(item);
    if (customizations) {
      // Open customization modal
      setActiveOptionsItem(item);
      setSelectedOptions({});
      setOptionsError(null);
    } else {
      // Add directly
      addCartItem(item, {});
    }
  };

  // Add Item logic
  const addCartItem = (item: MenuItem, options: { [key: string]: string }) => {
    // Generate unique ID based on item ID and options
    const optionValues = Object.entries(options)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`);
    const cartItemId = optionValues.length > 0 
      ? `${item.id}-${optionValues.join('-')}` 
      : item.id;

    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.id === cartItemId);
      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      } else {
        return [...prev, { id: cartItemId, item, quantity: 1, selectedOptions: options }];
      }
    });
  };

  // Decrease quantity or remove item from cart by cartItemId
  const decreaseQty = (cartItemId: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.id === cartItemId);
      if (existingIndex === -1) return prev;

      const newCart = [...prev];
      if (newCart[existingIndex].quantity <= 1) {
        newCart.splice(existingIndex, 1);
      } else {
        newCart[existingIndex].quantity -= 1;
      }
      return newCart;
    });
  };

  // Increase quantity by cartItemId
  const increaseQty = (cartItemId: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.id === cartItemId);
      if (existingIndex === -1) return prev;

      const newCart = [...prev];
      newCart[existingIndex].quantity += 1;
      return newCart;
    });
  };

  // Handle custom options submission
  const handleConfirmCustomizations = () => {
    if (!activeOptionsItem) return;
    
    const customizations = getCustomizations(activeOptionsItem)!;
    const missing = customizations.filter((c) => c.required && !selectedOptions[c.title]);

    if (missing.length > 0) {
      setOptionsError(`Please make a selection for: ${missing.map(m => m.title).join(', ')}`);
      return;
    }

    addCartItem(activeOptionsItem, selectedOptions);
    setActiveOptionsItem(null);
    setSelectedOptions({});
    setOptionsError(null);
  };

  // Calculate cart stats
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, cartItem) => {
    const price = typeof cartItem.item.price === 'string' ? parseFloat(cartItem.item.price) : cartItem.item.price;
    return total + price * cartItem.quantity;
  }, 0);

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
                  const qtyInCart = getItemQtyInCart(item.id);
                  const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                  const isCustomizable = getCustomizations(item) !== null;
                  
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
                        {qtyInCart > 0 && (
                          <div className="in-cart-badge">
                            {qtyInCart} in Cart
                          </div>
                        )}

                        {isCustomizable ? (
                          <button
                            className="add-to-cart-btn customize-btn"
                            onClick={() => handleAddItemClick(item)}
                          >
                            {qtyInCart > 0 ? 'Add Another' : 'Customize'}
                          </button>
                        ) : (
                          qtyInCart === 0 ? (
                            <button
                              className="add-to-cart-btn"
                              onClick={() => handleAddItemClick(item)}
                            >
                              Agregar al carrito
                            </button>
                          ) : (
                            // For simple items, show a direct +/- selector in the card
                            <div className="quantity-selector">
                              <button
                                className="qty-btn minus"
                                onClick={() => {
                                  // Find the simple item's cartItemId (which is just the item ID)
                                  decreaseQty(item.id);
                                }}
                              >
                                −
                              </button>
                              <span className="qty-value">{qtyInCart}</span>
                              <button
                                className="qty-btn plus"
                                onClick={() => addCartItem(item, {})}
                              >
                                +
                              </button>
                            </div>
                          )
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

      {/* Customization Options Modal */}
      {activeOptionsItem && (() => {
        const customizations = getCustomizations(activeOptionsItem);
        if (!customizations) return null;

        return (
          <div className="cart-overlay" onClick={() => setActiveOptionsItem(null)}>
            <div 
              className="cart-drawer options-modal" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cart-drawer-header">
                <div>
                  <h2 className="options-modal-title">Customize Item</h2>
                  <p className="options-modal-item-name">{activeOptionsItem.name}</p>
                </div>
                <button 
                  className="close-drawer-btn" 
                  onClick={() => setActiveOptionsItem(null)}
                >
                  ✕
                </button>
              </div>

              <div className="cart-drawer-content options-modal-content">
                {optionsError && (
                  <div className="options-error-banner">
                    {optionsError}
                  </div>
                )}

                {customizations.map((option) => (
                  <div key={option.title} className="option-group">
                    <h3 className="option-group-title">
                      {option.title} {option.required && <span className="required-star">*</span>}
                    </h3>
                    <div className="option-choices-list">
                      {option.choices.map((choice) => {
                        const isSelected = selectedOptions[option.title] === choice;
                        return (
                          <label 
                            key={choice} 
                            className={`option-choice-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [option.title]: choice
                              }));
                              setOptionsError(null);
                            }}
                          >
                            <input
                              type="radio"
                              name={option.title}
                              value={choice}
                              checked={isSelected}
                              onChange={() => {}}
                              className="hidden-radio"
                            />
                            <div className="choice-radio-circle">
                              {isSelected && <div className="choice-radio-circle-inner" />}
                            </div>
                            <span className="choice-label-text">{choice}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-drawer-footer">
                <button 
                  className="checkout-btn add-custom-btn"
                  onClick={handleConfirmCustomizations}
                >
                  Add to Cart - ${(typeof activeOptionsItem.price === 'string' ? parseFloat(activeOptionsItem.price) : activeOptionsItem.price).toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cart.map(({ id, item, quantity, selectedOptions: opts }) => {
                    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                    const optLabels = Object.entries(opts).map(([k, v]) => v).join(', ');
                    
                    return (
                      <div key={id} className="cart-item-row">
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
                          {optLabels && (
                            <p className="cart-item-options-text">{optLabels}</p>
                          )}
                          <span className="cart-item-price-unit">${price.toFixed(2)} c/u</span>
                        </div>
                        <div className="cart-item-qty-actions">
                          <button
                            className="cart-qty-btn"
                            onClick={() => decreaseQty(id)}
                          >
                            −
                          </button>
                          <span className="cart-qty-val">{quantity}</span>
                          <button
                            className="cart-qty-btn"
                            onClick={() => increaseQty(id)}
                          >
                            +
                          </button>
                        </div>
                        <span className="cart-item-total">${(price * quantity).toFixed(2)}</span>
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
