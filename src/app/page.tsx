import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import MenuClient from './MenuClient';

// Force dynamic rendering to always fetch latest menu
export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  const { data: menuItems, error: itemsError } = await supabase
    .from('menu_items')
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
          <div className="logo-container">
            <Image
              src="/logolasnurys.png"
              alt="Las Nurys Logo"
              width={130}
              height={130}
              className="hero-logo"
              priority
            />
          </div>
          <h1>Las Nurys</h1>
          <p className="hero-tagline">Food Truck</p>
          <p className="subtitle">Our fish tacos bring the ocean to your plate. Nuestros tacos de pescado traen el mar a tu plato.</p>
        </div>
      </header>

      <MenuClient
        categories={categories || []}
        menuItems={menuItems || []}
      />
    </main>
  );
}

