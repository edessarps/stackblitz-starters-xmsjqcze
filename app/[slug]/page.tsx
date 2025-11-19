import { supabase } from '../../utils/supabaseClient'; // Attention : on est descendu d'un étage, donc ../../
import ProductList from '../ProductList'; // Idem, on remonte d'un cran pour trouver le composant

// Next.js nous donne accès aux "params" (paramètres de l'URL)
export default async function FarmShop({ params }: { params: { slug: string } }) {
  
  const { slug } = params; // ex: "ferme-bonheur"

  // 1. On récupère d'abord les infos de la ferme pour vérifier qu'elle existe
  // et on en profite pour récupérer son nom pour l'afficher en titre
  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (farmError || !farm) {
    return <div style={{padding: 20}}>Ferme introuvable ou URL incorrecte.</div>;
  }

  // 2. Maintenant on récupère l'inventaire UNIQUEMENT pour cette ferme (farm.id)
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
    .eq('farm_id', farm.id) // <--- LE FILTRE MAGIQUE EST ICI
    .eq('is_visible', true);

  if (error) {
    return <div>Erreur de chargement du stock.</div>;
  }

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Le titre devient dynamique ! */}
      <h1>Bienvenue chez : {farm.name} 🚜</h1>
      
      <ProductList items={items || []} />

    </main>
  );
}