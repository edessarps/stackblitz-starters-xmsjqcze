import { createClient } from '@supabase/supabase-js'

// REMPLACEZ CI-DESSOUS PAR VOTRE VRAIE URL (celle qui commence par https://)
const supabaseUrl = 'https://bphwybuhytsxevvugxhu.supabase.co' 

// REMPLACEZ CI-DESSOUS PAR VOTRE VRAIE CLÉ (celle qui commence par eyJh...)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaHd5YnVoeXRzeGV2dnVneGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODU4MDAsImV4cCI6MjA3ODk2MTgwMH0.y5TgsneXqMIMKiWcc42r2A0SnqoA1pFPpmoqal-hauE'

export const supabase = createClient(supabaseUrl, supabaseKey)