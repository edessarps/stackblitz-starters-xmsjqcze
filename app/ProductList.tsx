'use client' // 👈 TRÈS IMPORTANT : Dit à Next.js "Ceci s'exécute dans le navigateur"

import { useState } from 'react'

export default function ProductList({ items }: { items: any[] }) {
  // C'est ici qu'on stocke l'état du panier (mémoire à court terme)
  // Au début, c'est une liste vide []
  const [cart, setCart] = useState<any[]>([])

  // Fonction qui se déclenche au clic
  const addToCart = (product: any) => {
    const newCart = [...cart, product] // On prend le panier actuel et on ajoute le produit
    setCart(newCart) // On met à jour la mémoire
    alert(`Ajouté : ${product.products.name} ! Vous avez ${newCart.length} articles.`)
  }

  return (
    <div>
      {/* Petit résumé du panier en haut */}
      <div style={{ background: '#f0f9ff', padding: '15px', marginBottom: '20px', border: '1px solid #bae6fd', borderRadius: '8px' }}>
        🛒 Panier : <strong>{cart.length}</strong> articles
        {cart.length > 0 && (
           <span style={{ marginLeft: '15px', fontSize: '0.9em' }}>
             (Total estimé: {cart.reduce((total, item) => total + item.price, 0)} €)
           </span>
        )}
      </div>

      {/* La grille des produits */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {items?.map((item: any) => (
          <div key={item.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: 'white', color: 'black' }}>
            
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

            {/* Le bouton magique qui appelle la fonction addToCart */}
            <button 
              onClick={() => addToCart(item)}
              style={{ width: '100%', marginTop: '15px', background: '#2e7d32', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Ajouter au panier
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}