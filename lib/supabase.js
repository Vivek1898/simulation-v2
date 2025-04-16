import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a singleton instance for the client side
let supabaseInstance = null

// Get the base URL for the current environment
export const getBaseUrl = () => {
  // Check if we're in the browser
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // For server-side rendering, try to use environment variables
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback to localhost in development
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
}

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// For server-side operations, always create a new client to avoid sharing between requests
export const createServerSupabaseClient = () => {
  return createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}
