import { supabase } from '../../utils/supabaseClient';
import ProductList from '../ProductList';

export default async function FarmShop({ params }: { params: { slug: string } }) {
  
  const { slug } = params;

  // 1. On récupère les infos de la ferme
  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (farmError || !farm) {
    return <div style={{padding: 20}}>Ferme introuvable ou URL incorrecte.</div>;
  }

  // 2. On récupère l'inventaire
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
        generic_products (
          image_url
        )
      )
    `)
    .eq('farm_id', farm.id)
    .eq('is_visible', true);

  if (error) {
    return <div>Erreur de chargement du stock.</div>;
  }

  return (
    <main className="min-h-screen p-8 font-sans bg-gray-50">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête de la ferme */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-2">
            {farm.name} <span className="text-green-500">.</span>
          </h1>
          <p className="text-gray-500">Commandez vos produits frais directement au producteur</p>
        </div>
        
        {/* On passe bien les données et l'ID de la ferme */}
        <ProductList items={items || []} farmId={farm.id} />
        
      </div>
    </main>
  );
}