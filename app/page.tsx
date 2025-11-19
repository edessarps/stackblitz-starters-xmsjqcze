import { supabase } from '../utils/supabaseClient';

export default async function Home() {
  
  // On demande l'INVENTAIRE (ce qui est à vendre)
  // Et on va chercher les infos du produit associé via la relation
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
    .eq('is_visible', true); // On ne veut que ce qui est visible

  if (error) {
    return (
      <div style={{ color: 'white', padding: '20px' }}>
        <h2>Erreur Technique :</h2>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Cagette.pro : En vente cette semaine 🚜</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {items?.map((item: any) => (
          <div key={item.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: 'white', color: 'black' }}>
            
            {/* Image du produit */}
            <img 
              src={item.products?.generic_products?.image_url || 'https://placehold.co/300x200'} 
              alt={item.products?.name} 
              style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
            />
            
            <h2>{item.products?.name}</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#2e7d32' }}>
                {item.price} € / {item.products?.unit}
              </span>
              <span style={{ fontSize: '0.9em', color: '#666' }}>
                Stock: {item.stock_quantity}
              </span>
            </div>

            <button style={{ width: '100%', marginTop: '15px', background: '#2e7d32', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>
              Ajouter au panier
            </button>
          </div>
        ))}
      </div>
      
      {items?.length === 0 && <p>Aucun produit en vente pour le moment.</p>}
    </main>
  );
}