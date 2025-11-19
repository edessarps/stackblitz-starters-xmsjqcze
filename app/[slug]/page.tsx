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
      farm_id,   // <--- AJOUTEZ CETTE LIGNE
      products (
        id,      // <--- ET CELLE-CI (pour avoir l'ID du produit)
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
    <main className="min-h-screen p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête de la ferme */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-2">
            {farm.name} <span className="text-green-500">.</span>
          </h1>
          <p className="text-gray-500">Commandez vos produits frais directement au producteur</p>
        </div>
        
        <ProductList items={items || []} />
        
      </div>
    </main>
  );
}