'use client'

import { useState } from 'react'

export default function ProductList({ items }: { items: any[] }) {
  const [cart, setCart] = useState<any[]>([])

  const addToCart = (product: any) => {
    const newCart = [...cart, product]
    setCart(newCart)
    // On retire l'alerte pour faire plus pro, on voit le compteur monter
  }

  return (
    <div>
      {/* BARRE DU PANIER (Sticky pour rester en haut) */}
      <div className="sticky top-4 z-50 mb-8 mx-auto max-w-2xl">
        <div className="bg-white/80 backdrop-blur-md border border-green-100 shadow-lg rounded-full px-6 py-3 flex justify-between items-center">
          <span className="font-medium text-gray-700">Votre Panier</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {cart.reduce((total, item) => total + item.price, 0).toFixed(2)} €
            </span>
            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {cart.length}
            </span>
          </div>
        </div>
      </div>

      {/* GRILLE DES PRODUITS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items?.map((item: any) => (
          <div key={item.id} className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-green-100 flex flex-col items-center relative">
            
            {/* Icône Coeur (Décoratif pour l'instant) */}
            <div className="absolute top-4 right-4 text-gray-300 hover:text-red-400 cursor-pointer transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>

            {/* Image */}
            <div className="w-full h-40 mb-4 overflow-hidden">
              <img 
                src={item.products?.generic_products?.image_url || 'https://placehold.co/300x200'} 
                alt={item.products?.name} 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            {/* Titre */}
            <h2 className="text-lg font-bold text-gray-800 mb-1 text-center">
              {item.products?.name}
            </h2>
            
            {/* Description légère (Lorem ipsum dans votre image) */}
            <p className="text-xs text-gray-400 mb-4 text-center">
              Origine France • Catégorie 1
            </p>
            
            {/* Prix et Bouton */}
            <div className="w-full flex justify-between items-center mt-auto pt-2 border-t border-dashed border-gray-100">
              <div className="flex flex-col">
                <span className="text-green-600 font-bold text-xl">
                  {item.price} €
                </span>
                <span className="text-xs text-gray-400">
                   / {item.products?.unit}
                </span>
              </div>

              <button 
                onClick={() => addToCart(item)}
                className="bg-green-50 text-green-600 hover:bg-green-500 hover:text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm active:scale-90"
              >
                {/* Icône Plus (+) */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>

          </div>
        ))}
      </div>
      
      {items?.length === 0 && (
         <div className="text-center py-20 text-gray-400">
            {/* On remplace l'apostrophe par &apos; */}
            <p>Aucun produit sur l&apos;étal aujourd&apos;hui.</p>
         </div>
      )}