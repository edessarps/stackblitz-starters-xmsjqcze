'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://bphwvybuhytsxevvugxhu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaHd5YnVoeXRzeGV2dnVneGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODU4MDAsImV4cCI6MjA3ODk2MTgwMH0.y5TgsneXqMIMKiWcc42r2A0SnqoA1pFPpmoqal-hauE'
)

export default function FarmerAdmin({ params }: { params: { slug: string } }) {
  const [orders, setOrders] = useState<any[]>([])
  const [farmName, setFarmName] = useState('')

  useEffect(() => {
    const fetchFarmOrders = async () => {
      // 1. Trouver l'ID de la ferme grâce au slug
      const { data: farm } = await supabase.from('farms').select('id, name').eq('slug', params.slug).single()
      if (!farm) return
      setFarmName(farm.name)

      // 2. Trouver les commandes DE CETTE FERME
      const { data } = await supabase
        .from('orders')
        .select(`*, profiles(first_name, last_name, phone), order_items(quantity, price_at_order, products(name))`)
        .eq('farm_id', farm.id) // <--- LE FILTRE EST ICI
        .order('created_at', { ascending: false })
      
      if (data) setOrders(data)
    }
    fetchFarmOrders()
  }, [params.slug])

  return (
    <div className="p-8 bg-green-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-900">🚜 {farmName || 'Chargement...'}</h1>
      
      <div className="grid gap-4">
        {orders.map(o => (
          <div key={o.id} className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex justify-between mb-4">
                <div>
                    <h3 className="font-bold text-lg">{o.profiles?.first_name} {o.profiles?.last_name}</h3>
                    <p className="text-sm text-gray-500">{o.profiles?.phone} • {new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{o.total_price} €</div>
                    <div className="text-sm uppercase tracking-wide text-gray-400">{o.status}</div>
                </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                {o.order_items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between py-1 border-b last:border-0 border-gray-200">
                        <span>{item.quantity} x {item.products?.name}</span>
                        <span>{(item.price_at_order * item.quantity).toFixed(2)} €</span>
                    </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}