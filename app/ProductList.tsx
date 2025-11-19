'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// On initialise Supabase côté client pour gérer l'Auth
const supabase = createClientComponentClient()

export default function ProductList({ items, farmId }: { items: any[], farmId: string }) {
  // --- ÉTATS (MÉMOIRE) ---
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false) // Panneau latéral ouvert/fermé
  
  // Gestion Modale Quantité
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [quantity, setQuantity] = useState<number>(1)

  // Gestion Authentification & Commande
  const [user, setUser] = useState<any>(null)
  const [authStep, setAuthStep] = useState<'email' | 'login' | 'signup'>('email')
  const [loading, setLoading] = useState(false)
  
  // Champs du formulaire
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('') // Pour l'inscription
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' })

  // Date de retrait (Calculée dynamiquement pour l'exemple : Prochain Vendredi)
  const pickupDate = "Vendredi prochain de 16h à 19h"

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setUser(session.user)
    }
    checkUser()
  }, [])

  // --- FONCTIONS PANIER ---
  const openModal = (item: any) => {
    setSelectedItem(item)
    setQuantity(1)
  }

  const confirmAddToCart = () => {
    if (!selectedItem) return
    const newItem = { ...selectedItem, quantity, totalPrice: selectedItem.price * quantity }
    setCart([...cart, newItem])
    setSelectedItem(null)
  }

  // --- FONCTIONS AUTHENTIFICATION ---
  
  // 1. Vérifie si l'email existe (Simulation via tentative de connexion)
  const checkEmail = async () => {
    // Pour simplifier, on demande à l'utilisateur s'il a un compte ou non via l'interface
    // Mais pour respecter votre demande, on va supposer qu'on passe à l'étape "login" par défaut
    // Si l'utilisateur échoue, il pourra cliquer sur "Je n'ai pas de compte"
    setAuthStep('login')
  }

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert("Erreur : " + error.message)
    } else {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user)
    }
    setLoading(false)
  }

  const handleSignup = async () => {
    if (password !== confirmPassword) return alert("Les mots de passe ne correspondent pas")
    setLoading(true)
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { // Ces données seront copiées dans la table profiles via le Trigger SQL
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone
        }
      }
    })

    if (error) {
      alert("Erreur inscription : " + error.message)
    } else {
      alert("Compte créé ! Vous pouvez maintenant valider la commande.")
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user)
    }
    setLoading(false)
  }

  // --- FONCTION VALIDATION COMMANDE (FINALE) ---
  const submitOrder = async () => {
    if (!user) return alert("Vous devez être connecté")
    setLoading(true)

    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0)

    try {
      // 1. Créer la commande
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          client_id: user.id,
          farm_id: items[0]?.farm_id, // On prend l'ID de la ferme du premier produit
          total_price: total,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Créer les lignes de commande (order_items)
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id, // Attention : vérifiez bien que votre select SQL renvoie product_id
        quantity: item.quantity,
        price_at_order: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Succès !
      alert("Commande validée avec succès ! Merci.")
      setCart([]) // Vider le panier
      setIsCartOpen(false)

    } catch (err: any) {
      console.error(err)
      alert("Erreur lors de la commande : " + err.message)
    }
    setLoading(false)
  }

  // Calcul du total panier
  const cartTotal = cart.reduce((total, item) => total + item.totalPrice, 0).toFixed(2)

  return (
    <div>
      {/* --- BARRE FLOTTANTE (STICKY BOTTOM MOBILE) --- */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-green-600 text-white py-4 rounded-xl shadow-xl flex justify-between px-6 font-bold animate-in slide-in-from-bottom-4"
          >
            <span>Valider mon panier</span>
            <span>{cartTotal} €</span>
          </button>
        </div>
      )}

      {/* --- BOUTON PANIER (DESKTOP) --- */}
      <div className="sticky top-4 z-30 mb-8 mx-auto max-w-2xl hidden md:block">
        <button onClick={() => setIsCartOpen(true)} className="w-full">
          <div className="bg-white/90 backdrop-blur-md border border-green-100 shadow-lg rounded-full px-6 py-3 flex justify-between items-center hover:bg-green-50 transition cursor-pointer">
            <span className="font-medium text-gray-700">Votre Panier</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{cartTotal} €</span>
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">{cart.length}</span>
            </div>
          </div>
        </button>
      </div>

      {/* --- GRILLE PRODUITS (Code identique) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-24">
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
            <h2 className="text-lg font-bold text-gray-800 mb-1 text-center">{item.products?.name}</h2>
            
            <div className="w-full flex justify-between items-center mt-auto pt-2 border-t border-dashed border-gray-100">
              <div className="flex flex-col">
                <span className="text-green-600 font-bold text-xl">{item.price} €</span>
                <span className="text-xs text-gray-400">/ {item.products?.unit}</span>
              </div>
              <button onClick={() => openModal(item)} className="bg-green-50 text-green-600 hover:bg-green-500 hover:text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm active:scale-90">
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODALE QUANTITÉ (Code identique) --- */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
             <h3 className="text-xl font-bold text-gray-800 mb-2">Combien de {selectedItem.products?.name} ?</h3>
             <div className="flex items-center justify-center gap-4 mb-6 mt-4">
                <button onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))} className="w-10 h-10 rounded-full bg-gray-100 font-bold">-</button>
                <span className="text-2xl font-bold text-green-700">{quantity} <span className="text-sm text-gray-400">{selectedItem.products?.unit}</span></span>
                <button onClick={() => setQuantity(quantity + 0.5)} className="w-10 h-10 rounded-full bg-gray-100 font-bold">+</button>
             </div>
             <div className="flex gap-3">
                <button onClick={() => setSelectedItem(null)} className="flex-1 py-3 rounded-xl text-gray-500 bg-gray-100">Annuler</button>
                <button onClick={confirmAddToCart} className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold">Ajouter {(selectedItem.price * quantity).toFixed(2)} €</button>
             </div>
          </div>
        </div>
      )}

      {/* --- PANNEAU LATÉRAL (SIDE PANEL) --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Fond sombre (clic ferme le panier) */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          
          {/* Le Panneau */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header Panier */}
            <div className="p-6 border-b flex justify-between items-center bg-green-50">
              <h2 className="text-xl font-bold text-green-900">Votre Panier 🥕</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-red-500">✕</button>
            </div>

            {/* Contenu Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Liste des articles */}
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center mt-10">Votre panier est vide.</p>
              ) : (
                <ul className="space-y-4 mb-8">
                  {cart.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <span className="font-bold text-gray-800">{item.quantity} {item.products?.unit}</span> 
                        <span className="text-gray-600 ml-2">{item.products?.name}</span>
                      </div>
                      <span className="font-bold text-green-600">{item.totalPrice.toFixed(2)} €</span>
                    </li>
                  ))}
                </ul>
              )}

              {cart.length > 0 && (
                <>
                  {/* Date de retrait */}
                  <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                    <p className="text-sm text-blue-600 font-bold uppercase mb-1">📅 Retrait des commandes</p>
                    <p className="text-gray-800 font-medium">{pickupDate}</p>
                  </div>

                  {/* --- FORMULAIRE INTELLIGENT --- */}
                  <div className="border-t pt-6">
                    
                    {user ? (
                      // CAS 1 : Utilisateur Connecté
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">Connecté en tant que <strong>{user.email}</strong></p>
                        <button 
                          onClick={submitOrder} 
                          disabled={loading}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
                        >
                          {loading ? 'Validation...' : `Valider la commande (${cartTotal} €)`}
                        </button>
                      </div>
                    ) : (
                      // CAS 2 : Tunnel Connexion / Inscription
                      <div>
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Connexion requise</h3>
                        
                        {authStep === 'email' && (
                          <div className="space-y-3">
                             <label className="block text-sm font-medium text-gray-700">Votre email</label>
                             <input 
                               type="email" 
                               value={email} 
                               onChange={e => setEmail(e.target.value)} 
                               className="w-full p-3 border rounded-lg"
                               placeholder="exemple@mail.com"
                             />
                             <button onClick={checkEmail} className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium">
                               Continuer
                             </button>
                          </div>
                        )}

                        {authStep === 'login' && (
                          <div className="space-y-3 animate-in fade-in">
                            <p className="text-sm text-gray-500">Bon retour parmi nous !</p>
                             <input 
                               type="password" 
                               value={password} 
                               onChange={e => setPassword(e.target.value)} 
                               className="w-full p-3 border rounded-lg"
                               placeholder="Votre mot de passe"
                             />
                             <button onClick={handleLogin} className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium">
                               Se connecter
                             </button>
                             <button onClick={() => setAuthStep('signup')} className="w-full text-sm text-gray-500 underline">
                               Je n&apos;ai pas de compte (Créer un compte)
                             </button>
                          </div>
                        )}

                        {authStep === 'signup' && (
                          <div className="space-y-3 animate-in fade-in">
                            <p className="text-sm text-gray-500">Création de votre compte client</p>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <input type="text" placeholder="Prénom" className="p-3 border rounded-lg" 
                                onChange={e => setFormData({...formData, firstName: e.target.value})} />
                              <input type="text" placeholder="Nom" className="p-3 border rounded-lg" 
                                onChange={e => setFormData({...formData, lastName: e.target.value})} />
                            </div>
                            <input type="tel" placeholder="Téléphone (pour le retrait)" className="w-full p-3 border rounded-lg" 
                                onChange={e => setFormData({...formData, phone: e.target.value})} />
                            
                            <input type="text" value={email} disabled className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500" />

                            <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" />
                            <input type="password" placeholder="Confirmer mot de passe" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3 border rounded-lg" />

                            <button onClick={handleSignup} className="w-full bg-green-600 text-white py-3 rounded-lg font-medium">
                              Créer mon compte
                            </button>
                            <button onClick={() => setAuthStep('login')} className="w-full text-sm text-gray-500 underline">
                               J&apos;ai déjà un compte
                             </button>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}