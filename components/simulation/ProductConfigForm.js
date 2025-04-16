"use client"

import { useState, useEffect } from "react"

export default function ProductConfigForm({ initialData, rawMaterials, onSubmit, onBack }) {
  const [productData, setProductData] = useState(
    initialData || {
      name: "",
      hsCode: "",
      assemblyLocation: "Canada",
      processingCost: 0,
      additionalCosts: 0,
    },
  )

  const [totalCost, setTotalCost] = useState({
    rawMaterials: 0,
    processing: 0,
    additional: 0,
    total: 0,
  })

  useEffect(() => {
    // Calculate raw materials cost
    const rawMaterialsCost = rawMaterials.reduce((sum, material) => sum + material.costPerUnit * material.quantity, 0)

    // Update total cost
    setTotalCost({
      rawMaterials: rawMaterialsCost,
      processing: productData.processingCost || 0,
      additional: productData.additionalCosts || 0,
      total: rawMaterialsCost + (productData.processingCost || 0) + (productData.additionalCosts || 0),
    })
  }, [rawMaterials, productData.processingCost, productData.additionalCosts])

  const handleChange = (field, value) => {
    setProductData({
      ...productData,
      [field]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(productData)
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Final Product Configuration</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Enter product name"
                value={productData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HS Code
                <span className="ml-1 text-gray-400 hover:text-gray-500 cursor-pointer">
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
                </span>
              </label>
              <div className="flex">
                <input
                  type="text"
                  className="w-full p-2 border rounded-l-md"
                  placeholder="Enter HS code"
                  value={productData.hsCode}
                  onChange={(e) => handleChange("hsCode", e.target.value)}
                />
                <button
                  type="button"
                  className="bg-blue-100 text-blue-600 px-3 rounded-r-md border-t border-r border-b"
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assembly Location</label>
              <select
                className="w-full p-2 border rounded-md"
                value={productData.assemblyLocation}
                onChange={(e) => handleChange("assemblyLocation", e.target.value)}
                required
              >
                <option value="Canada">Canada</option>
                <option value="US">United States</option>
                <option value="MX">Mexico</option>
                <option value="CN">China</option>
                <option value="VN">Vietnam</option>
                <option value="IN">India</option>
                <option value="DE">Germany</option>
                <option value="UK">United Kingdom</option>
              </select>
            </div>
          </div>

          <h3 className="font-medium mb-4">Materials Used</h3>

          <div className="mb-6">
            <div className="relative">
              <input type="text" className="w-full p-2 border rounded-md" placeholder="Search materials..." disabled />
              <button type="button" className="absolute right-2 top-2 bg-blue-600 text-white p-1 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {rawMaterials.map((material, index) => (
              <div key={material.id} className="flex items-center justify-between p-3 border-b">
                <div>
                  <div className="font-medium">{material.name || `Raw Material ${index + 1}`}</div>
                  <div className="text-sm text-gray-500">
                    HS Code: {material.hsCode || "N/A"} • Origin: {material.countryOfOrigin || "N/A"}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Quantity:</span>
                  <input type="number" className="w-20 p-1 border rounded-md" value={material.quantity} readOnly />
                  <button
                    type="button"
                    className="ml-2 text-red-600"
                    onClick={() => {
                      // This would be implemented to remove the material
                      alert("In a real app, this would remove the material")
                    }}
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
            ))}
          </div>

          <h3 className="font-medium mb-4">Manufacturing Costs</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Processing Cost (CAD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full p-2 border rounded-md"
                placeholder="0.00"
                value={productData.processingCost || ""}
                onChange={(e) => handleChange("processingCost", Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Costs (CAD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full p-2 border rounded-md"
                placeholder="0.00"
                value={productData.additionalCosts || ""}
                onChange={(e) => handleChange("additionalCosts", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
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
              Next
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
            <span className="font-medium">CAD {totalCost.rawMaterials.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Processing Cost</span>
            <span className="font-medium">CAD {totalCost.processing.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Additional Costs</span>
            <span className="font-medium">CAD {totalCost.additional.toFixed(2)}</span>
          </div>

          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Cost</span>
              <span className="text-blue-600">CAD {totalCost.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Cost Breakdown</h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-600">
                  Cost visualization chart
                </span>
              </div>
            </div>
            <div className="flex h-4 mb-4 overflow-hidden rounded-full bg-gray-200">
              {totalCost.total > 0 && (
                <>
                  <div
                    style={{ width: `${(totalCost.rawMaterials / totalCost.total) * 100}%` }}
                    className="bg-blue-500"
                  ></div>
                  <div
                    style={{ width: `${(totalCost.processing / totalCost.total) * 100}%` }}
                    className="bg-green-500"
                  ></div>
                  <div
                    style={{ width: `${(totalCost.additional / totalCost.total) * 100}%` }}
                    className="bg-yellow-500"
                  ></div>
                </>
              )}
            </div>
            <div className="flex text-xs justify-between">
              <span className="text-blue-600">Raw Materials</span>
              <span className="text-green-600">Processing</span>
              <span className="text-yellow-600">Additional</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
