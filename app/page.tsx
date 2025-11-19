import Image from 'next/image';
import { supabase } from '../utils/supabaseClient'; // Vérifiez que le chemin vers utils est bon

export default async function Home() {
  
  // 1. On demande les produits ET on joint la table generic_products pour avoir l'image
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      unit,
      generic_products (
        image_url
      )
    `);

  // Gestion simple d'erreur (s'affiche dans la console du serveur)
  if (error) {
    console.error("Erreur Supabase:", error);
    return <div>Erreur de chargement des données.</div>;
  }

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Bienvenue sur Cagette.pro 🥬</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {products?.map((product: any) => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
            {/* On affiche l'image récupérée via la relation. 
                Note: generic_products est un objet ou un tableau selon la relation. Ici on suppose un lien direct. */}
            {product.generic_products && (
              <Image 
              src={product.generic_products.image_url} 
              alt={product.name} 
              width={300} // Mettez une taille approximative
              height={150}
              style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
            />
            )}
            
            <h3>{product.name}</h3>
            <p>Vendu par : {product.unit}</p>
            
            <button style={{ background: 'green', color: 'white', border: 'none', padding: '8px 16px', cursor: 'pointer', borderRadius: '4px' }}>
              Ajouter au panier
            </button>
          </div>
        ))}
      </div>
      
      {products?.length === 0 && <p>Aucun produit trouvé.</p>}
    </main>
  );
}