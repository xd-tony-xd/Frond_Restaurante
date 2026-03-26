import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gqyvnofiopqkgtovnhgj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxeXZub2Zpb3Bxa2d0b3ZuaGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDYxMzIsImV4cCI6MjA5MDA4MjEzMn0.5nRD_dMtayKjijL2dxkAruZxRNc4py0jfKdZb-IDnm8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)