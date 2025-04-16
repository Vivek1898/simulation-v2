"use client"

import { useState } from "react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

export default function ResultsDashboard({ results, simulationData, onSaveScenario, onExport }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Calculate percentage change
  const calculateChange = (value, baseline) => {
    if (!baseline) return 0
    return ((value - baseline) / baseline) * 100
  }

  // Format percentage change with + or - sign
  const formatChange = (change) => {
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
  }

  // Handle save with loading state
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSaveScenario()
    } finally {
      setIsSaving(false)
    }
  }

  // Cost breakdown chart data
  const costBreakdownData = {
    labels: ["Raw Materials", "Processing", "Tariffs", "Other Costs"],
    datasets: [
      {
        label: "Cost Breakdown",
        data: [results.rawMaterialsCost, results.processingCost, results.tariffCost, results.additionalCosts],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  // Scenario comparison data
  const scenarioComparisonData = {
    labels: ["Domestic", "Export"],
    datasets: [
      {
        label: "Gross Margin (%)",
        data: [42.5, 38.2],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(54, 162, 235, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(54, 162, 235, 1)"],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="grid md:grid-cols-4 gap-4 p-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Raw Material Cost</div>
          <div className="text-2xl font-bold">${formatNumber(results.rawMaterialsCost)}</div>
          <div
            className={`text-xs ${calculateChange(results.rawMaterialsCost, 22000) > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatChange(calculateChange(results.rawMaterialsCost, 22000))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Final Product Cost</div>
          <div className="text-2xl font-bold">${formatNumber(results.totalCost)}</div>
          <div
            className={`text-xs ${calculateChange(results.totalCost, 32500) > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatChange(calculateChange(results.totalCost, 32500))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Gross Margin</div>
          <div className="text-2xl font-bold">{results.grossMargin.toFixed(1)}%</div>
          <div
            className={`text-xs ${calculateChange(results.grossMargin, 40.5) > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatChange(calculateChange(results.grossMargin, 40.5))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Tariff Burden</div>
          <div className="text-2xl font-bold">${formatNumber(results.tariffCost)}</div>
          <div className="text-xs text-gray-500">{((results.tariffCost / results.totalCost) * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 p-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Cost Breakdown</h2>
          <div className="h-64">
            <Bar
              data={costBreakdownData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Scenario Comparison</h2>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Domestic</span>
                <span className="text-sm">{results.grossMargin.toFixed(1)}% margin</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${results.grossMargin}%` }}></div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Export</span>
                <span className="text-sm">38.2% margin</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "38.2%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
            <span>Edit Raw Materials</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
            <span>Modify Product Config</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
            <span>Update Trade Scenario</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6 border-t">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Detailed Breakdown</h2>
          <button className="text-blue-600 text-sm flex items-center" onClick={onExport}>
            Export to CSV
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
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
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Component
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Base Cost
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tariff
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Final Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {simulationData.rawMaterials.map((material, index) => {
                const baseCost = material.costPerUnit * material.quantity
                const tariff = baseCost * (material.tariffRate / 100)
                const finalCost = baseCost + tariff

                return (
                  <tr key={material.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {material.name || `Raw Material ${index + 1}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatNumber(baseCost)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatNumber(tariff)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatNumber(finalCost)}</td>
                  </tr>
                )
              })}

              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Processing</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${formatNumber(results.processingCost)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$0.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${formatNumber(results.processingCost)}
                </td>
              </tr>

              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Additional Costs</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${formatNumber(results.additionalCosts)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$0.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${formatNumber(results.additionalCosts)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 border-t">
        <h2 className="text-lg font-semibold mb-4">Simulation Notes</h2>
        <textarea
          className="w-full p-3 border rounded-md"
          rows="4"
          placeholder="Add notes about this simulation..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
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
                Save Simulation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
