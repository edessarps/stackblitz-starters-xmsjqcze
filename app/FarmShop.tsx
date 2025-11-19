'use client'

import { useState } from 'react'
import ProductList from './ProductList'
import OrderHistory from './OrderHistory'

export default function FarmShop({ farm, items }: { farm: any, items: any[] }) {
  const [activeTab, setActiveTab] = useState<'farm' | 'shop' | 'history'>('shop')

  // Calcul dynamique du prochain retrait (Vendredi)
  const getNextFriday = () => {
    const d = new Date();
    d.setDate(d.getDate() + (5 + 7 - d.getDay()) % 7);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* 1. En-tête (Header) */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            {farm.name} <span className="text-green-500">.</span>
          </h1>
        </div>

        {/* 2. Le Menu (Tabs) */}
        <div className="flex justify-center gap-8 text-sm font-medium border-t overflow-x-auto">
          <button 
            onClick={() => setActiveTab('farm')}
            className={`py-4 px-2 border-b-2 transition-colors ${activeTab === 'farm' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            La Ferme
          </button>
          
          <button 
            onClick={() => setActiveTab('shop')}
            className={`py-4 px-2 border-b-2 transition-colors ${activeTab === 'shop' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            La vitrine du <span className="capitalize">{getNextFriday()}</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`py-4 px-2 border-b-2 transition-colors ${activeTab === 'history' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            Historique de commande
          </button>
        </div>
      </div>

      {/* 3. Le Contenu */}
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Onglet 1 : Présentation */}
        {activeTab === 'farm' && (
           <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm animate-in fade-in">
             <h2 className="text-2xl font-bold mb-4">À propos de {farm.name}</h2>
             <div className="prose text-gray-600">
               <p>Bienvenue sur notre espace de vente directe !</p>
               <p className="mt-4">
                 Nous sommes des producteurs passionnés installés localement. 
                 Tous nos produits sont récoltés à maturité pour vous garantir le meilleur goût.
               </p>
               <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                 <strong>📍 Adresse :</strong><br/>
                 123 Chemin des Champs<br/>
                 33000 Bordeaux
               </div>
             </div>
           </div>
        )}

        {/* Onglet 2 : Vitrine (On utilise 'hidden' pour ne pas perdre le panier quand on change d'onglet) */}
        <div className={activeTab === 'shop' ? 'block' : 'hidden'}>
          <ProductList items={items} farmId={farm.id} />
        </div>

        {/* Onglet 3 : Historique */}
        {activeTab === 'history' && (
          <OrderHistory />
        )}

      </div>
    </div>
  )
}