"use client"

import Head from "next/head"
import { AuthProvider } from "../contexts/AuthContext"
import "../styles/globals.css"

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>TariffSim - Tariff and Export Impact Simulator</title>
        <meta
          name="description"
          content="Simulate the cost and profitability of producing and exporting products with TariffSim"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default MyApp
