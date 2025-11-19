import { supabase } from '../utils/supabaseClient';
import ProductList from './ProductList'; // On importe notre nouveau composant

export default async function Home() {
  
  // 1. Récupération des données (Côté Serveur)
  const { data: items, error } = await supabase
    .from('inventory')
    .select(`
      id,
      price,
      stock_quantity,
      products (
        name,
        unit,
        generic_products (
          image_url
        )
      )
    `)
    .eq('is_visible', true);

  if (error) {
    return <div style={{color:'white'}}>Erreur: {error.message}</div>;
  }

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Cagette.pro : En vente cette semaine 🚜</h1>
      
      {/* 2. On passe les données au composant Client pour l'affichage et le panier */}
      {/* Si items est null, on envoie une liste vide [] */}
      <ProductList items={items || []} />

    </main>
  );
}