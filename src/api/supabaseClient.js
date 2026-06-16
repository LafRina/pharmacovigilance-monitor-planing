import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://addgfxzhheoblzufzatb.supabase.co'

const supabaseAnonKey = 'sb_publishable_DXun2VjPZI6X20CGRpdNfQ_r0Rnh3IU' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)