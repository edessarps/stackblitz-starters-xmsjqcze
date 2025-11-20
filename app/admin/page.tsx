'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Remettez vos clés ici (Méthode Brute)
const supabase = createClient(
  'https://bphwvybuhytsxevvugxhu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaHd5YnVoeXRzeGV2dnVneGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODU4MDAsImV4cCI6MjA3ODk2MTgwMH0.y5TgsneXqMIMKiWcc42r2A0SnqoA1pFPpmoqal-hauE'
)

export default function SuperAdmin() {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      // On récupère TOUT, et on inclut le nom de la ferme pour savoir d'où ça vient
      const { data } = await supabase
        .from('orders')
        .select(`*, profiles(first_name, last_name), farms(name)`)
        .order('created_at', { ascending: false })
      
      if (data) setOrders(data)
    }
    fetchAll()
  }, [])

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">👑 Super Admin Dashboard</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl mb-4">Toutes les commandes ({orders.length})</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-500"><th className="py-2">Date</th><th>Ferme</th><th>Client</th><th>Total</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="py-3">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="font-bold text-green-700">{o.farms?.name}</td>
                <td>{o.profiles?.first_name} {o.profiles?.last_name}</td>
                <td className="font-bold">{o.total_price} €</td>
                <td><span className="bg-gray-200 px-2 py-1 rounded text-xs">{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}