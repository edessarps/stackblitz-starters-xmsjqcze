'use client'

import { useState } from 'react'

export default function ProductList({ items }: { items: any[] }) {
  // État du panier
  const [cart, setCart] = useState<any[]>([])
  
  // État pour la fenêtre de quantité (Modale)
  const [selectedItem, setSelectedItem] = useState<any | null>(null) // Le produit qu'on est en train de modifier
  const [quantity, setQuantity] = useState<number>(1) // La quantité choisie (défaut 1)

  // 1. Quand on clique sur le bouton "+" d'une carte
  const openModal = (item: any) => {
    setSelectedItem(item)
    setQuantity(1) // On remet à 1 par défaut à l'ouverture
  }

  // 2. Quand on valide la quantité dans la fenêtre
  const confirmAddToCart = () => {
    if (!selectedItem) return

    const newItem = {
      ...selectedItem,
      quantity: quantity, // On ajoute la quantité choisie
      totalPrice: selectedItem.price * quantity // On calcule le prix total de la ligne
    }

    setCart([...cart, newItem])
    setSelectedItem(null) // On ferme la fenêtre
  }

  // Fonction pour annuler
  const closeModal = () => {
    setSelectedItem(null)
  }

  return (
    <div>
      {/* --- BARRE DU PANIER --- */}
      <div className="sticky top-4 z-40 mb-8 mx-auto max-w-2xl">
        <div className="bg-white/90 backdrop-blur-md border border-green-100 shadow-lg rounded-full px-6 py-3 flex justify-between items-center">
          <span className="font-medium text-gray-700">Votre Panier</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {/* Calcul du total en prenant en compte la quantité */}
              {cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)} €
            </span>
            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {cart.length}
            </span>
          </div>
        </div>
      </div>

      {/* --- GRILLE DES PRODUITS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 z-10">
        {items?.map((item: any) => (
          <div key={item.id} className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-green-100 flex flex-col items-center relative">
            
            {/* Image */}
            <div className="w-full h-40 mb-4 overflow-hidden">
              <img 
                src={item.products?.generic_products?.image_url || 'https://placehold.co/300x200'} 
                alt={item.products?.name} 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            <h2 className="text-lg font-bold text-gray-800 mb-1 text-center">
              {item.products?.name}
            </h2>
            <p className="text-xs text-gray-400 mb-4 text-center">Origine France • Catégorie 1</p>
            
            <div className="w-full flex justify-between items-center mt-auto pt-2 border-t border-dashed border-gray-100">
              <div className="flex flex-col">
                <span className="text-green-600 font-bold text-xl">{item.price} €</span>
                <span className="text-xs text-gray-400">/ {item.products?.unit}</span>
              </div>

              {/* Le bouton ouvre maintenant la modale au lieu d'ajouter directement */}
              <button 
                onClick={() => openModal(item)}
                className="bg-green-50 text-green-600 hover:bg-green-500 hover:text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- LA MODALE (FENÊTRE DE QUANTITÉ) --- */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Combien de {selectedItem.products?.name} ?
            </h3>
            
            <p className="text-gray-500 mb-6">
              Prix unitaire : {selectedItem.price} € / {selectedItem.products?.unit}
            </p>

            {/* Champ de saisie Quantité */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button 
                onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold text-gray-600"
              >
                -
              </button>
              
              <div className="flex flex-col items-center">
                <input 
                    type="number" 
                    step="0.5"
                    min="0.5"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value))}
                    className="w-20 text-center text-2xl font-bold text-green-700 border-b-2 border-green-200 focus:outline-none focus:border-green-500"
                />
                <span className="text-xs text-gray-400 mt-1">{selectedItem.products?.unit}</span>
              </div>

              <button 
                onClick={() => setQuantity(quantity + 0.5)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold text-gray-600"
              >
                +
              </button>
            </div>

            {/* Résumé du prix total pour cet article */}
            <div className="bg-green-50 p-3 rounded-lg mb-6 text-center text-green-800 font-medium">
              Total : {(selectedItem.price * quantity).toFixed(2)} €
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <button 
                onClick={closeModal}
                className="flex-1 py-3 rounded-xl text-gray-500 font-medium hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={confirmAddToCart}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                Ajouter au panier
              </button>
            </div>

          </div>
        </div>
      )}

      {items?.length === 0 && (
         <div className="text-center py-20 text-gray-400">
            <p>Aucun produit sur l&apos;étal aujourd&apos;hui.</p>
         </div>
      )}
    </div>
  )
}