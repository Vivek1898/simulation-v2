"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Layout from "../../components/Layout"
import { getSimulationById, updateSimulation } from "../../services/supabaseSimulationService"
import ResultsDashboard from "../../components/simulation/ResultsDashboard"

export default function SimulationDetails() {
  const router = useRouter()
  const { id } = router.query
  const [simulation, setSimulation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!router.isReady) return

    const fetchSimulation = async () => {
      try {
        const data = await getSimulationById(id)
        if (!data) {
          setError("Simulation not found")
        } else {
          setSimulation(data)
        }
      } catch (err) {
        console.error("Error fetching simulation:", err)
        setError("Failed to load simulation")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSimulation()
  }, [id, router.isReady])

  const handleSaveScenario = async () => {
    try {
      if (!simulation) return

      const updatedSimulation = {
        ...simulation.simulation_data,
        status: "Completed",
      }

      await updateSimulation(id, updatedSimulation)
      alert("Simulation updated successfully!")
    } catch (error) {
      console.error("Failed to update simulation:", error)
      alert("Failed to update simulation. Please try again.")
    }
  }

  const handleExport = () => {
    // Export functionality
    console.log("Exporting simulation data...")
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push("/saved-simulations")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Saved Simulations
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  if (!simulation) {
    return (
      <Layout>
        <div className="p-6">
          <div
            className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Simulation not found!</strong>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push("/saved-simulations")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Saved Simulations
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const simulationData = simulation.simulation_data

  return (
    <Layout>
      <Head>
        <title>{simulation.name} - TariffSim</title>
      </Head>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{simulation.name}</h1>
            <p className="text-gray-600">HS Code: {simulation.hs_code}</p>
          </div>
          <div className="flex gap-2">
            <button
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-1"
              onClick={() => router.push("/saved-simulations")}
            >
              Back to Simulations
            </button>
            <button
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-1"
              onClick={handleSaveScenario}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Save Changes
            </button>
            <button
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-1"
              onClick={handleExport}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 bg-gray-100 rounded-md">
              <span className="text-sm text-gray-500">Status</span>
              <div className="font-medium">{simulation.status}</div>
            </div>
            <div className="px-4 py-2 bg-gray-100 rounded-md">
              <span className="text-sm text-gray-500">Type</span>
              <div className="font-medium">{simulation.type}</div>
            </div>
            <div className="px-4 py-2 bg-gray-100 rounded-md">
              <span className="text-sm text-gray-500">Created</span>
              <div className="font-medium">{new Date(simulation.created_at).toLocaleDateString()}</div>
            </div>
            <div className="px-4 py-2 bg-gray-100 rounded-md">
              <span className="text-sm text-gray-500">Last Updated</span>
              <div className="font-medium">{new Date(simulation.updated_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {simulationData.results && (
          <ResultsDashboard
            results={simulationData.results}
            simulationData={simulationData}
            onSaveScenario={handleSaveScenario}
            onExport={handleExport}
          />
        )}
      </div>
    </Layout>
  )
}
