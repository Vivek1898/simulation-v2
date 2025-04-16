"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Layout from "../components/Layout"
import { getSimulationsForComparison } from "../services/supabaseSimulationService"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function ComparisonPage() {
  const router = useRouter()
  const [simulations, setSimulations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSimulations = async () => {
      if (!router.isReady) return

      const { ids } = router.query
      if (!ids) {
        setError("No simulations selected for comparison")
        setIsLoading(false)
        return
      }

      try {
        const simulationIds = ids.split(",")
        const data = await getSimulationsForComparison(simulationIds)
        setSimulations(data)
      } catch (err) {
        console.error("Error fetching simulations:", err)
        setError("Failed to load simulations for comparison")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSimulations()
  }, [router.isReady, router.query])

  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Prepare chart data
  const prepareChartData = () => {
    const labels = simulations.map((sim) => sim.name)

    const rawMaterialsData = simulations.map((sim) => sim.raw_materials)
    const processingData = simulations.map((sim) => sim.processing)
    const tariffsData = simulations.map((sim) => sim.tariffs)

    return {
      labels,
      datasets: [
        {
          label: "Raw Materials",
          data: rawMaterialsData,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Processing",
          data: processingData,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Tariffs",
          data: tariffsData,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    }
  }

  // Prepare total cost chart data
  const prepareTotalCostData = () => {
    const labels = simulations.map((sim) => sim.name)
    const totalCostData = simulations.map((sim) => sim.total_cost)

    return {
      labels,
      datasets: [
        {
          label: "Total Cost",
          data: totalCostData,
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    }
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

  if (simulations.length === 0) {
    return (
      <Layout>
        <div className="p-6">
          <div
            className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">No simulations found!</strong>
            <span className="block sm:inline"> Please select simulations to compare.</span>
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

  return (
    <Layout>
      <Head>
        <title>Simulation Comparison - TariffSim</title>
      </Head>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Simulation Comparison</h1>
          <button
            onClick={() => router.push("/saved-simulations")}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Back to Saved Simulations
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {simulations.map((simulation) => (
            <div key={simulation.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{simulation.name}</h2>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    simulation.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {simulation.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500">HS Code: {simulation.hs_code}</p>
                <p className="text-sm text-gray-500">Type: {simulation.type}</p>
                <p className="text-sm text-gray-500">Created: {new Date(simulation.created_at).toLocaleDateString()}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Raw Materials:</span>
                  <span className="font-medium">${formatNumber(simulation.raw_materials)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing:</span>
                  <span className="font-medium">${formatNumber(simulation.processing)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tariffs:</span>
                  <span className="font-medium">${formatNumber(simulation.tariffs)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total Cost:</span>
                  <span className="font-semibold text-blue-600">${formatNumber(simulation.total_cost)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push(`/simulation/${simulation.id}`)}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Cost Breakdown Comparison</h2>
          <div className="h-80">
            <Bar
              data={prepareChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: "Cost Components by Simulation",
                  },
                },
                scales: {
                  x: {
                    stacked: false,
                  },
                  y: {
                    stacked: false,
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Total Cost Comparison</h2>
          <div className="h-80">
            <Bar
              data={prepareTotalCostData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: "Total Cost by Simulation",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}
