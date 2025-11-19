'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function OrderHistory() {
  const supabase = createClientComponentClient()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      // 1. Qui est connecté ?
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setLoading(false)
        return
      }
      setUser(session.user)

      // 2. On récupère les commandes ET le détail des produits (jointure imbriquée)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          farms (name),
          order_items (
            quantity,
            price_at_order,
            products (name, unit)
          )
        `)
        .eq('client_id', session.user.id)
        .order('created_at', { ascending: false })

      if (data) setOrders(data)
      setLoading(false)
    }

    fetchOrders()
  }, [])

  if (loading) return <div className="p-8 text-center">Chargement de l'historique...</div>
  if (!user) return <div className="p-8 text-center text-gray-500">Connectez-vous dans l'onglet "Vitrine" pour voir vos commandes.</div>

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Mes commandes passées 📦</h2>
      
      {orders.length === 0 ? (
        <p className="text-gray-500">Aucune commande pour le moment.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* En-tête de la commande */}
              <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
                <div>
                  <p className="font-bold text-gray-800">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500">Chez : {order.farms?.name}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                    order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status === 'pending' ? 'En attente' : order.status}
                  </span>
                  <p className="font-bold text-gray-900 mt-1">{order.total_price} €</p>
                </div>
              </div>

              {/* Liste des produits */}
              <div className="p-4">
                <ul className="space-y-2">
                  {order.order_items.map((item: any, idx: number) => (
                    <li key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity} {item.products?.unit} x {item.products?.name}
                      </span>
                      <span>{(item.price_at_order * item.quantity).toFixed(2)} €</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}