import { createClient } from '@supabase/supabase-js'

// REMPLACEZ CI-DESSOUS PAR VOTRE VRAIE URL (celle qui commence par https://)
const supabaseUrl = 'https://bphwvybuhytsxevvugxhu.supabase.co' 

// REMPLACEZ CI-DESSOUS PAR VOTRE VRAIE CLÉ (celle qui commence par eyJh...)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaHd2eWJ1aHl0c3hldnZ1Z3hodSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM3MTI2Mzc5LCJleHAiOjIwNTI3MDIzNzl9.wIIMKiWcc42r2AOSnqoA1pFPpmoqal-hauE'

export const supabase = createClient(supabaseUrl, supabaseKey)