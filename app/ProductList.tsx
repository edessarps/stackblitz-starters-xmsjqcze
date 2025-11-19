'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// On initialise Supabase pour le client (navigateur)
const supabase = createClientComponentClient()

export default function ProductList({ items, farmId }: { items: any[], farmId: string }) {
  // --- ÉTATS ---
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [quantity, setQuantity] = useState<number>(1)

  // Auth & User
  const [user, setUser] = useState<any>(null)
  const [authStep, setAuthStep] = useState<'email' | 'login' | 'signup'>('email')
  const [loading, setLoading] = useState(false)
  
  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('') 
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' })

  const pickupDate = "Vendredi prochain de 16h à 19h"

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

  // --- AUTH ---
  const checkEmail = async () => {
    setAuthStep('login')
  }

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert("Erreur : " + error.message)
    else {
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
        data: { 
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone
        }
      }
    })

    if (error) alert("Erreur inscription : " + error.message)
    else {
      alert("Compte créé !")
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user)
    }
    setLoading(false)
  }

  // --- COMMANDE ---
  const submitOrder = async () => {
    if (!user) return alert("Connectez-vous d'abord")
    setLoading(true)

    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0)

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          client_id: user.id,
          farm_id: farmId, 
          total_price: total,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.products.id, 
        quantity: item.quantity,
        price_at_order: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      alert("Commande validée avec succès ! Merci.")
      setCart([]) 
      setIsCartOpen(false)

    } catch (err: any) {
      console.error(err)
      alert("Erreur : " + err.message)
    }
    setLoading(false)
  }

  const cartTotal = cart.reduce((total, item) => total + item.totalPrice, 0).toFixed(2)

  return (
    <div>
      {/* Mobile Sticky Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
          <button onClick={() => setIsCartOpen(true)} className="w-full bg-green-600 text-white py-4 rounded-xl shadow-xl flex justify-between px-6 font-bold">
            <span>Valider</span><span>{cartTotal} €</span>
          </button>
        </div>
      )}

      {/* Desktop Sticky Button */}
      <div className="sticky top-4 z-30 mb-8 mx-auto max-w-2xl hidden md:block">
        <button onClick={() => setIsCartOpen(true)} className="w-full">
           <div className="bg-white/90 backdrop-blur-md border border-green-100 shadow-lg rounded-full px-6 py-3 flex justify-between items-center hover:bg-green-50 transition">
            <span className="font-medium text-gray-700">Votre Panier</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{cartTotal} €</span>
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">{cart.length}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-24">
        {items?.map((item: any) => (
          <div key={item.id} className="group bg-white rounded-3xl p-4 shadow-sm border border-transparent hover:border-green-100 flex flex-col items-center">
             <div className="w-full h-40 mb-4 overflow-hidden">
              <img src={item.products?.generic_products?.image_url || 'https://placehold.co/300x200'} alt={item.products?.name} className="w-full h-full object-contain" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1 text-center">{item.products?.name}</h2>
            <div className="w-full flex justify-between items-center mt-auto pt-2 border-t border-dashed border-gray-100">
              <div className="flex flex-col"><span className="text-green-600 font-bold text-xl">{item.price} €</span><span className="text-xs text-gray-400">/ {item.products?.unit}</span></div>
              <button onClick={() => openModal(item)} className="bg-green-50 text-green-600 hover:bg-green-500 hover:text-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modale Quantité */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
             <h3 className="text-xl font-bold text-gray-800 mb-2">Combien de {selectedItem.products?.name} ?</h3>
             <div className="flex items-center justify-center gap-4 mb-6 mt-4">
                <button onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))} className="w-10 h-10 rounded-full bg-gray-100 font-bold">-</button>
                <span className="text-2xl font-bold text-green-700">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 0.5)} className="w-10 h-10 rounded-full bg-gray-100 font-bold">+</button>
             </div>
             <div className="flex gap-3">
                <button onClick={() => setSelectedItem(null)} className="flex-1 py-3 rounded-xl text-gray-500 bg-gray-100">Annuler</button>
                <button onClick={confirmAddToCart} className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold">Ajouter</button>
             </div>
          </div>
        </div>
      )}

      {/* Panneau Latéral */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-6 border-b flex justify-between items-center bg-green-50">
              <h2 className="text-xl font-bold text-green-900">Votre Panier 🥕</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-red-500">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (<p className="text-gray-400 text-center mt-10">Vide.</p>) : (
                <ul className="space-y-4 mb-8">
                  {cart.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center border-b pb-2">
                      <div><span className="font-bold text-gray-800">{item.quantity} {item.products?.unit}</span> <span className="text-gray-600 ml-2">{item.products?.name}</span></div>
                      <span className="font-bold text-green-600">{item.totalPrice.toFixed(2)} €</span>
                    </li>
                  ))}
                </ul>
              )}
              
              {cart.length > 0 && (
                <div className="border-t pt-6">
                   <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100"><p className="text-sm text-blue-600 font-bold uppercase">📅 Retrait</p><p className="text-gray-800">{pickupDate}</p></div>
                   
                   {user ? (
                      <button onClick={submitOrder} disabled={loading} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg">
                        {loading ? '...' : `Valider (${cartTotal} €)`}
                      </button>
                   ) : (
                      <div>
                        {authStep === 'email' && (
                          <div className="space-y-3">
                             <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Email" />
                             <button onClick={checkEmail} className="w-full bg-gray-900 text-white py-3 rounded-lg">Continuer</button>
                          </div>
                        )}
                        {authStep === 'login' && (
                          <div className="space-y-3">
                             <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Mot de passe" />
                             <button onClick={handleLogin} className="w-full bg-gray-900 text-white py-3 rounded-lg">Se connecter</button>
                             <button onClick={() => setAuthStep('signup')} className="w-full text-sm text-gray-500 underline">Créer un compte</button>
                          </div>
                        )}
                        {authStep === 'signup' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <input type="text" placeholder="Prénom" className="p-3 border rounded-lg" onChange={e => setFormData({...formData, firstName: e.target.value})} />
                              <input type="text" placeholder="Nom" className="p-3 border rounded-lg" onChange={e => setFormData({...formData, lastName: e.target.value})} />
                            </div>
                            <input type="tel" placeholder="Téléphone" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, phone: e.target.value})} />
                            <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" />
                            <input type="password" placeholder="Confirmer" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3 border rounded-lg" />
                            <button onClick={handleSignup} className="w-full bg-green-600 text-white py-3 rounded-lg">S&apos;inscrire</button>
                          </div>
                        )}
                      </div>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}