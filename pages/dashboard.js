"use client"

import Head from "next/head"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../components/Layout"
import { getAllSimulations } from "../services/supabaseSimulationService"
import { useAuth } from "../contexts/AuthContext"

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [simulations, setSimulations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid") // 'list' or 'grid'
  const [searchTerm, setSearchTerm] = useState("")
  const [productFilter, setProductFilter] = useState("All Products")
  const [dateFilter, setDateFilter] = useState("Last 30 days")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSimulations, setSelectedSimulations] = useState([])
  const [totalSimulations, setTotalSimulations] = useState(0)
  const simulationsPerPage = 9

  useEffect(() => {
    if (user) {
      loadSimulations()
    }
  }, [user, currentPage, productFilter, dateFilter])

  // Debounce search term
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (user) {
        loadSimulations()
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  async function loadSimulations() {
    try {
      setIsLoading(true)
      const data = await getAllSimulations()

      // Apply filters
      let filteredData = data

      // Search filter
      if (searchTerm) {
        filteredData = filteredData.filter(
          (sim) =>
            sim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sim.hs_code.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      // Product type filter
      if (productFilter !== "All Products") {
        filteredData = filteredData.filter((sim) => sim.type === productFilter)
      }

      // Date filter
      if (dateFilter !== "All time") {
        const cutoffDate = new Date()
        if (dateFilter === "Last 30 days") {
          cutoffDate.setDate(cutoffDate.getDate() - 30)
        } else if (dateFilter === "Last 90 days") {
          cutoffDate.setDate(cutoffDate.getDate() - 90)
        } else if (dateFilter === "Last year") {
          cutoffDate.setFullYear(cutoffDate.getFullYear() - 1)
        }

        filteredData = filteredData.filter((sim) => new Date(sim.created_at) >= cutoffDate)
      }

      setTotalSimulations(filteredData.length)

      // Pagination
      const startIndex = (currentPage - 1) * simulationsPerPage
      const paginatedData = filteredData.slice(startIndex, startIndex + simulationsPerPage)

      setSimulations(paginatedData)
    } catch (error) {
      console.error("Failed to load simulations:", error)
    } finally {
      setIsLoading(false)
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

  const totalPages = Math.ceil(totalSimulations / simulationsPerPage)

  return (
    <Layout>
      <Head>
        <title>Dashboard - TariffSim</title>
      </Head>

      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">View and manage your tariff simulations</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search simulations..."
              className="w-full px-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
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
              onChange={(e) => {
                setProductFilter(e.target.value)
                setCurrentPage(1) // Reset to first page on filter change
              }}
            >
              <option>All Products</option>
              <option>Domestic</option>
              <option>Export</option>
            </select>

            <select
              className="px-4 py-2 border rounded-md"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value)
                setCurrentPage(1) // Reset to first page on filter change
              }}
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
        ) : simulations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No simulations found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || productFilter !== "All Products" || dateFilter !== "Last 30 days"
                ? "Try adjusting your search or filters"
                : "Create your first simulation to get started"}
            </p>
            <button
              onClick={() => router.push("/simulation/new")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Simulation
            </button>
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
                    {simulations.map((simulation) => (
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
                            <button
                              className="text-gray-600 hover:text-gray-900"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
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
                {simulations.map((simulation) => (
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
                        <button
                          className="text-gray-600 hover:text-gray-900"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * simulationsPerPage + 1}-
                  {Math.min(currentPage * simulationsPerPage, totalSimulations)} of {totalSimulations} simulations
                </div>
                <div className="flex space-x-2">
                  <button
                    className={`px-3 py-1 border rounded-md text-sm ${
                      currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  {/* Show page numbers */}
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === i + 1 ? "bg-blue-600 text-white" : "border hover:bg-gray-100"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className={`px-3 py-1 border rounded-md text-sm ${
                      currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
