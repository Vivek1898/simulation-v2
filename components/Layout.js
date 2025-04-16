"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useAuth } from "../contexts/AuthContext"

export default function Layout({ children }) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut, loading } = useAuth()

  // Redirect to sign in if not authenticated
  if (!loading && !user && router.pathname !== "/signin" && router.pathname !== "/signup" && router.pathname !== "/") {
    router.push("/signin")
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="text-blue-600 font-semibold text-xl">
              TariffSim
            </Link>
            {user && (
              <nav className="hidden md:flex ml-10 space-x-8">
                <Link
                  href="/dashboard"
                  className={`${router.pathname === "/dashboard" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/saved-simulations"
                  className={`${router.pathname === "/saved-simulations" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Saved Simulations
                </Link>
                <Link
                  href="/settings"
                  className={`${router.pathname === "/settings" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Settings
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button className="text-gray-600 hover:text-gray-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <button className="text-gray-600 hover:text-gray-900 hidden md:block" onClick={signOut}>
                  Sign Out
                </button>
                <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                {router.pathname !== "/signin" && router.pathname !== "/signup" && (
                  <>
                    <Link href="/signin" className="text-gray-600 hover:text-gray-900">
                      Sign In
                    </Link>
                    <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && user && (
          <div className="md:hidden border-t">
            <nav className="px-4 py-2 space-y-2">
              <Link href="/dashboard" className="block py-2 text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/saved-simulations" className="block py-2 text-gray-600 hover:text-gray-900">
                Saved Simulations
              </Link>
              <Link href="/settings" className="block py-2 text-gray-600 hover:text-gray-900">
                Settings
              </Link>
              <button onClick={signOut} className="block w-full text-left py-2 text-gray-600 hover:text-gray-900">
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
