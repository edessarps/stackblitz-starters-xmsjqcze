'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AdminDashboard() {
  // Configuration Brute (comme dans les autres fichiers pour être sûr)
  const supabase = createClientComponentClient({
    supabaseUrl: 'https://bphwvybuhytsxevvugxhu.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaHd5YnVoeXRzeGV2dnVneGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODU4MDAsImV4cCI6MjA3ODk2MTgwMH0.y5TgsneXqMIMKiWcc42r2A0SnqoA1pFPpmoqal-hauE'
  })

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fonction pour charger les commandes
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (first_name, last_name, phone, user_id), 
        order_items (
          quantity,
          price_at_order,
          products (name, unit)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) console.error('Erreur:', error)
    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Fonction pour changer le statut d'une commande
  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (!error) {
      // On recharge la liste pour voir le changement
      fetchOrders() 
    } else {
      alert("Erreur lors de la mise à jour")
    }
  }

  if (loading) return <div className="p-10 text-center">Chargement du tableau de bord...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord Maraîcher 🚜</h1>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm">
            <strong>{orders.length}</strong> commandes totales
          </div>
        </div>

        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              
              {/* En-tête de la commande */}
              <div className="bg-gray-50 p-4 border-b flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {order.profiles?.first_name} {order.profiles?.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    📞 {order.profiles?.phone || 'Non renseigné'} • 
                    📧 {new Date(order.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-xl text-gray-700">{order.total_price} €</span>
                  
                  {/* Sélecteur de statut */}
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-sm font-bold border-none cursor-pointer ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <option value="pending">En attente</option>
                    <option value="completed">Terminée / Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
              </div>

              {/* Détail des produits */}
              <div className="p-4 bg-white">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-2">Produit</th>
                      <th className="px-4 py-2">Quantité</th>
                      <th className="px-4 py-2 text-right">Prix unit.</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="px-4 py-2 font-medium text-gray-900">{item.products?.name}</td>
                        <td className="px-4 py-2">{item.quantity} {item.products?.unit}</td>
                        <td className="px-4 py-2 text-right">{item.price_at_order} €</td>
                        <td className="px-4 py-2 text-right font-bold">{(item.price_at_order * item.quantity).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl text-gray-400">
              Aucune commande pour le moment.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}