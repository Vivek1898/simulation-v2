"use client"

import { useState, useEffect } from "react"

export default function TradeScenarioForm({ initialData, productData, rawMaterialsData, onSubmit, onBack }) {
  const [tradeData, setTradeData] = useState(
    initialData || {
      saleLocation: "Domestic",
      destinationCountry: "",
      productTariff: 0,
      otherCosts: {
        shipping: 0,
        insurance: 0,
        duties: 0,
        other: 0,
      },
      sellingPrice: 0,
    },
  )

  const [costSummary, setCostSummary] = useState({
    rawMaterials: 0,
    manufacturing: 0,
    tariffs: 0,
    otherCosts: 0,
    totalCost: 0,
    suggestedPrice: 0,
  })

  useEffect(() => {
    // Calculate raw materials cost
    const rawMaterialsCost = rawMaterialsData.reduce(
      (sum, material) => sum + material.costPerUnit * material.quantity,
      0,
    )

    // Calculate tariffs
    const tariffCost = rawMaterialsData.reduce(
      (sum, material) => sum + (material.costPerUnit * material.quantity * material.tariffRate) / 100,
      0,
    )

    // Calculate manufacturing costs
    const manufacturingCost = (productData.processingCost || 0) + (productData.additionalCosts || 0)

    // Calculate other costs
    const otherCostsTotal = Object.values(tradeData.otherCosts).reduce(
      (sum, cost) => sum + (Number.parseFloat(cost) || 0),
      0,
    )

    // Calculate total cost
    const totalCost = rawMaterialsCost + manufacturingCost + tariffCost + otherCostsTotal

    // Calculate suggested price (30% markup)
    const suggestedPrice = totalCost * 1.3

    setCostSummary({
      rawMaterials: rawMaterialsCost,
      manufacturing: manufacturingCost,
      tariffs: tariffCost,
      otherCosts: otherCostsTotal,
      totalCost,
      suggestedPrice,
    })

    // Update selling price if it's not set yet
    if (!tradeData.sellingPrice) {
      setTradeData((prev) => ({
        ...prev,
        sellingPrice: suggestedPrice,
      }))
    }
  }, [rawMaterialsData, productData, tradeData.otherCosts])

  const handleChange = (field, value) => {
    setTradeData({
      ...tradeData,
      [field]: value,
    })
  }

  const handleOtherCostChange = (field, value) => {
    setTradeData({
      ...tradeData,
      otherCosts: {
        ...tradeData.otherCosts,
        [field]: Number.parseFloat(value) || 0,
      },
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(tradeData)
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Sales & Trade Scenario</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sale Location</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-600"
                  name="saleLocation"
                  value="Domestic"
                  checked={tradeData.saleLocation === "Domestic"}
                  onChange={() => handleChange("saleLocation", "Domestic")}
                />
                <span className="ml-2">Domestic</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-600"
                  name="saleLocation"
                  value="Export"
                  checked={tradeData.saleLocation === "Export"}
                  onChange={() => handleChange("saleLocation", "Export")}
                />
                <span className="ml-2">Export</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <span>Compare Scenarios</span>
              <div className="relative inline-block w-10 ml-2 align-middle select-none">
                <input type="checkbox" name="compareScenarios" id="compareScenarios" className="sr-only" />
                <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
              </div>
            </label>
          </div>

          {tradeData.saleLocation === "Export" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Country <span className="text-gray-400">(For Export)</span>
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={tradeData.destinationCountry}
                onChange={(e) => handleChange("destinationCountry", e.target.value)}
                required={tradeData.saleLocation === "Export"}
              >
                <option value="">Select country...</option>
                <option value="US">United States</option>
                <option value="MX">Mexico</option>
                <option value="EU">European Union</option>
                <option value="UK">United Kingdom</option>
                <option value="CN">China</option>
                <option value="JP">Japan</option>
                <option value="KR">South Korea</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Tariff (%)
              <button type="button" className="ml-1 text-blue-600 hover:text-blue-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 inline"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="sr-only">Help</span>
              </button>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              className="w-full p-2 border rounded-md"
              placeholder="Enter tariff percentage"
              value={tradeData.productTariff || ""}
              onChange={(e) => handleChange("productTariff", Number.parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Other Costs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Shipping</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter shipping cost"
                  value={tradeData.otherCosts.shipping || ""}
                  onChange={(e) => handleOtherCostChange("shipping", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Insurance</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter insurance cost"
                  value={tradeData.otherCosts.insurance || ""}
                  onChange={(e) => handleOtherCostChange("insurance", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Duties</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter duties cost"
                  value={tradeData.otherCosts.duties || ""}
                  onChange={(e) => handleOtherCostChange("duties", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Other</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter other costs"
                  value={tradeData.otherCosts.other || ""}
                  onChange={(e) => handleOtherCostChange("other", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (CAD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full p-2 border rounded-md"
              placeholder="Enter selling price"
              value={tradeData.sellingPrice || ""}
              onChange={(e) => handleChange("sellingPrice", Number.parseFloat(e.target.value) || 0)}
              required
            />
            <p className="text-sm text-gray-500 mt-1 text-right">
              Suggested: CAD {costSummary.suggestedPrice.toFixed(2)}
            </p>
          </div>

          <div className="flex justify-between mt-8">
            <button
              type="button"
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              onClick={onBack}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Continue
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Cost Summary</h2>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Raw Materials</span>
            <span className="font-medium">CAD {costSummary.rawMaterials.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Manufacturing</span>
            <span className="font-medium">CAD {costSummary.manufacturing.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Tariffs</span>
            <span className="font-medium">CAD {costSummary.tariffs.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Other Costs</span>
            <span className="font-medium">CAD {costSummary.otherCosts.toFixed(2)}</span>
          </div>

          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Cost</span>
              <span className="text-blue-600">CAD {costSummary.totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
