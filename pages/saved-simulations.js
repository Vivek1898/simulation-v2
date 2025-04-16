"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Layout from "../components/Layout"
import { getAllSimulations, deleteSimulation } from "../services/supabaseSimulationService"
import { useAuth } from "../contexts/AuthContext"

export default function SavedSimulations() {
  const router = useRouter()
  const { user } = useAuth()
  const [simulations, setSimulations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid") // 'list' or 'grid'
  const [searchTerm, setSearchTerm] = useState("")
  const [productFilter, setProductFilter] = useState("All Products")
  const [dateFilter, setDateFilter] = useState("Last 30 days")
  const [selectedSimulations, setSelectedSimulations] = useState([])

  useEffect(() => {
    if (user) {
      loadSimulations()
    }
  }, [user])

  async function loadSimulations() {
    try {
      setIsLoading(true)
      const data = await getAllSimulations()
      setSimulations(data)
    } catch (error) {
      console.error("Failed to load simulations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSimulation = async (id) => {
    if (window.confirm("Are you sure you want to delete this simulation?")) {
      try {
        await deleteSimulation(id)
        setSimulations(simulations.filter((sim) => sim.id !== id))
      } catch (error) {
        console.error("Failed to delete simulation:", error)
      }
    }
  }

  const handleSelectSimulation = (id) => {
    setSelectedSimulations((prev) => {
      if (prev.includes(id)) {
        return prev.filter((simId) => simId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleCompareSelected = () => {
    if (selectedSimulations.length < 2) {
      alert("Please select at least 2 simulations to compare")
      return
    }

    router.push({
      pathname: "/comparison",
      query: { ids: selectedSimulations.join(",") },
    })
  }

  const filteredSimulations = simulations.filter((sim) => {
    const matchesSearch =
      searchTerm === "" ||
      sim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sim.hs_code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesProduct = productFilter === "All Products" || sim.type === productFilter

    // Simple date filter implementation
    if (dateFilter === "Last 30 days") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return matchesSearch && matchesProduct && new Date(sim.created_at) >= thirtyDaysAgo
    }

    return matchesSearch && matchesProduct
  })

  return (
    <Layout>
      <Head>
        <title>Saved Simulations - TariffSim</title>
      </Head>

      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Saved Simulations</h1>
          <p className="text-gray-600">Review and manage your previous tariff simulations</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search simulations..."
              className="w-full px-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="flex gap-4">
            <select
              className="px-4 py-2 border rounded-md"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            >
              <option>All Products</option>
              <option>Domestic</option>
              <option>Export</option>
            </select>

            <select
              className="px-4 py-2 border rounded-md"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
        </div>

        <div className="flex mb-6 gap-2">
          <button
            className={`px-4 py-2 rounded-md ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setViewMode("grid")}
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
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            className={`px-4 py-2 rounded-md ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setViewMode("list")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>

          <div className="ml-auto flex gap-2">
            {selectedSimulations.length > 0 && (
              <button
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={handleCompareSelected}
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Compare Selected ({selectedSimulations.length})
              </button>
            )}
            <button
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={() => router.push("/simulation/new")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Simulation
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {viewMode === "list" ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"
                      >
                        <span className="sr-only">Select</span>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date Created
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSimulations.map((simulation) => (
                      <tr key={simulation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={selectedSimulations.includes(simulation.id)}
                            onChange={() => handleSelectSimulation(simulation.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{simulation.name}</div>
                          <div className="text-sm text-gray-500">HS Code: {simulation.hs_code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(simulation.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              simulation.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {simulation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{simulation.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => router.push(`/simulation/${simulation.id}`)}
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
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
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
                                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                                />
                              </svg>
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteSimulation(simulation.id)}
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSimulations.map((simulation) => (
                  <div key={simulation.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{simulation.name}</h3>
                          <p className="text-sm text-gray-500">HS Code: {simulation.hs_code}</p>
                        </div>
                        <input
                          type="checkbox"
                          className="h-5 w-5 text-blue-600"
                          checked={selectedSimulations.includes(simulation.id)}
                          onChange={() => handleSelectSimulation(simulation.id)}
                        />
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 w-24">Raw Materials</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-300 h-2 rounded-full"
                              style={{ width: `${(simulation.raw_materials / simulation.total_cost) * 100}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium">${simulation.raw_materials.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 w-24">Processing</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-300 h-2 rounded-full"
                              style={{ width: `${(simulation.processing / simulation.total_cost) * 100}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium">${simulation.processing.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 w-24">Tariffs</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-300 h-2 rounded-full"
                              style={{ width: `${(simulation.tariffs / simulation.total_cost) * 100}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium">${simulation.tariffs.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm mb-4">
                        <div>
                          Created:{" "}
                          {new Date(simulation.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            simulation.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {simulation.status}
                        </span>
                      </div>

                      <button
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                        onClick={() => router.push(`/simulation/${simulation.id}`)}
                      >
                        View Details
                      </button>

                      <div className="flex justify-end mt-2 space-x-2">
                        <button className="text-gray-600 hover:text-gray-900">
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
                              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                            />
                          </svg>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteSimulation(simulation.id)}
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing 1-{Math.min(filteredSimulations.length, 12)} of {filteredSimulations.length} simulations
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border rounded-md text-sm">Previous</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">1</button>
                <button className="px-3 py-1 border rounded-md text-sm">2</button>
                <button className="px-3 py-1 border rounded-md text-sm">3</button>
                <button className="px-3 py-1 border rounded-md text-sm">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
