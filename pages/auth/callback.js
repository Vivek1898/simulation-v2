"use client"

import { useEffect } from "react"
import { useRouter } from "next/router"
import { getSupabase } from "../../lib/supabase"

export default function AuthCallback() {
    const router = useRouter()
    const supabase = getSupabase()

    useEffect(() => {
        // Get the hash from the URL
        const { hash } = window.location

        // If there's no hash, redirect to the sign-in page
        if (!hash) {
            router.push("/signin")
            return
        }

        // Process the hash and set the session
        const handleHashChange = async () => {
            try {
                // This will process the hash and set the session
                const { error } = await supabase.auth.getSession()

                if (error) {
                    console.error("Error processing auth callback:", error)
                    router.push("/signin")
                    return
                }

                // Redirect to the dashboard on successful authentication
                router.push("/dashboard")
            } catch (error) {
                console.error("Error in auth callback:", error)
                router.push("/signin")
            }
        }

        handleHashChange()
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold mb-2">Verifying your account...</h2>
                <p className="text-gray-600">Please wait while we complete the authentication process.</p>
            </div>
        </div>
    )
}
