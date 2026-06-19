import { supabase } from '@/lib/supabase';
import Image from 'next/image';

// Force dynamic rendering to always fetch latest menu
export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: categories, error: catError } = await supabase
    .from('lasnurys_categories')
    .select('*')
    .order('display_order', { ascending: true });

  const { data: menuItems, error: itemsError } = await supabase
    .from('lasnurys_menu_items')
    .select('*')
    .eq('is_available', true)
    .order('display_order', { ascending: true });

  console.log("Categories Error:", catError);
  console.log("Categories Data:", categories);
  console.log("Menu Items Error:", itemsError);
  console.log("Menu Items Data:", menuItems);

  return (
    <main className="menu-container">
      <header className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Las Nurys</h1>
          <p>Food Truck</p>
          <p className="subtitle">Our fish tacos bring the ocean to your plate. Nuestros tacos de pescado traen el mar a tu plato.</p>
        </div>
      </header>

      <div className="menu-content">
        {categories?.map((category) => {
          const itemsInCategory = menuItems?.filter(item => item.category_id === category.id);
          if (!itemsInCategory || itemsInCategory.length === 0) return null;

          return (
            <section key={category.id} className="category-section">
              <h2 className="category-title">{category.name}</h2>
              <div className="items-grid">
                {itemsInCategory.map((item) => (
                  <div key={item.id} className="menu-item-card">
                    <div className="menu-item-info">
                      <div className="menu-item-header">
                        <h3 className="item-name">{item.name}</h3>
                        <span className="item-price">${item.price.toFixed(2)}</span>
                      </div>
                      {item.name_es && item.name_es !== item.name && (
                        <p className="item-name-es">{item.name_es}</p>
                      )}
                      <p className="item-description">{item.description}</p>
                    </div>
                    {/* Image placeholder, will add images later */}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
