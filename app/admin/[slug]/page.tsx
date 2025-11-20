'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// On utilise le même client "Brute" pour être sûr que la connexion passe
const supabase = createClient(
  'https://bphwvybuhytsxevvugxhu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaHd5YnVoeXRzeGV2dnVneGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODU4MDAsImV4cCI6MjA3ODk2MTgwMH0.y5TgsneXqMIMKiWcc42r2A0SnqoA1pFPpmoqal-hauE'
)

export default function FarmerAdmin({ params }: { params: { slug: string } }) {
  const [orders, setOrders] = useState<any[]>([])
  const [farmName, setFarmName] = useState('Chargement...')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const fetchFarmOrders = async () => {
      try {
        // 1. Trouver l'ID de la ferme grâce au slug
        const { data: farm, error: farmError } = await supabase
            .from('farms')
            .select('id, name')
            .eq('slug', params.slug)
            .single()
        
        if (farmError) {
            setErrorMsg("Erreur récupération ferme : " + farmError.message)
            setFarmName("Erreur")
            return
        }
        if (!farm) {
            setErrorMsg("Ferme introuvable avec ce slug")
            setFarmName("Inconnue")
            return
        }
        
        setFarmName(farm.name)

        // 2. Trouver les commandes DE CETTE FERME
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`*, profiles(first_name, last_name, phone), order_items(quantity, price_at_order, products(name))`)
          .eq('farm_id', farm.id)
          .order('created_at', { ascending: false })
        
        if (ordersError) {
            setErrorMsg("Erreur récupération commandes : " + ordersError.message)
        } else {
            setOrders(ordersData || [])
        }

      } catch (err: any) {
          setErrorMsg("Erreur critique : " + err.message)
      }
    }
    fetchFarmOrders()
  }, [params.slug])

  return (
    <div className="p-8 bg-green-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-green-900">🚜 {farmName}</h1>
            <a href="/admin" className="text-sm text-green-700 underline">Retour Super Admin</a>
        </div>
        
        {/* Affichage des erreurs s'il y en a */}
        {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <strong>Problème :</strong> {errorMsg}
                <p className="text-sm mt-1">Vérifiez que vous êtes bien connecté avec un compte Admin.</p>
            </div>
        )}

        <div className="grid gap-6">
            {orders.map(o => (
            <div key={o.id} className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
                <div className="flex justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">{o.profiles?.first_name || 'Anonyme'} {o.profiles?.last_name}</h3>
                        <p className="text-sm text-gray-500">{o.profiles?.phone} • {new Date(o.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{o.total_price} €</div>
                        <div className="text-sm uppercase tracking-wide text-gray-400 font-bold">{o.status}</div>
                    </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {o.order_items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between py-1 border-b last:border-0 border-gray-200 text-gray-700">
                            <span>{item.quantity} x {item.products?.name}</span>
                            <span>{(item.price_at_order * item.quantity).toFixed(2)} €</span>
                        </div>
                    ))}
                </div>
            </div>
            ))}

            {orders.length === 0 && !errorMsg && (
                <p className="text-center text-gray-500 mt-10">Aucune commande pour cette ferme.</p>
            )}
        </div>
      </div>
    </div>
  )
}