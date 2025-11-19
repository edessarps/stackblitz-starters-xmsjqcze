import { supabase } from '../../utils/supabaseClient';
import FarmShop from '../FarmShop'; // <--- On importe le nouveau composant

export default async function Page({ params }: { params: { slug: string } }) {
  
  const { slug } = params;

  // 1. Récupération Ferme
  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (farmError || !farm) return <div style={{padding: 20}}>Ferme introuvable.</div>;

  // 2. Récupération Inventaire
  const { data: items, error } = await supabase
    .from('inventory')
    .select(`
      id,
      price,
      stock_quantity,
      farm_id,
      products (
        id,
        name,
        unit,
        origin,
        category,
        generic_products ( image_url )
      )
    `)
    .eq('farm_id', farm.id)
    .eq('is_visible', true);

  if (error) return <div>Erreur stock.</div>;

  // 3. On rend le "FarmShop" qui contient les onglets
  return (
    <FarmShop farm={farm} items={items || []} />
  );
}