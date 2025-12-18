import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hlssphbnfhjqgmchldrc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsc3NwaGJuZmhqcWdtY2hsZHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTkxMTYsImV4cCI6MjA4MTUzNTExNn0.yhHTNeaCIRWo06EuCxzMqqlk8QZZhUw_yqZlrcf6f7A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
