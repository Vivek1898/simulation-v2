"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"

export default function RawMaterialsForm({ initialData = [], onSubmit }) {
  const [materials, setMaterials] = useState(
    initialData.length > 0
      ? initialData
      : [
          {
            id: uuidv4(),
            name: "",
            hsCode: "",
            countryOfOrigin: "",
            costPerUnit: 0,
            quantity: 0,
            tariffRate: 0,
            notes: "",
          },
        ],
  )

  const handleAddMaterial = () => {
    setMaterials([
      ...materials,
      {
        id: uuidv4(),
        name: "",
        hsCode: "",
        countryOfOrigin: "",
        costPerUnit: 0,
        quantity: 0,
        tariffRate: 0,
        notes: "",
      },
    ])
  }

  const handleRemoveMaterial = (id) => {
    setMaterials(materials.filter((material) => material.id !== id))
  }

  const handleMaterialChange = (id, field, value) => {
    setMaterials(materials.map((material) => (material.id === id ? { ...material, [field]: value } : material)))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(materials)
  }

  const fetchTariffRate = (hsCode, countryOfOrigin) => {
    // In a real application, this would make an API call to fetch tariff rates
    console.log(`Fetching tariff rate for HS Code ${hsCode} from ${countryOfOrigin}`)
    // For demo purposes, return a random tariff rate between 0-15%
    return Math.floor(Math.random() * 15)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 mb-6">Enter the details for each raw material used in your product</p>

      <form onSubmit={handleSubmit}>
        {materials.map((material, index) => (
          <div key={material.id} className="mb-8 p-6 border rounded-lg relative">
            <h3 className="font-medium mb-4">Raw Material #{index + 1}</h3>

            {materials.length > 1 && (
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
                onClick={() => handleRemoveMaterial(material.id)}
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
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter material name"
                  value={material.name}
                  onChange={(e) => handleMaterialChange(material.id, "name", e.target.value)}
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
                    value={material.hsCode}
                    onChange={(e) => handleMaterialChange(material.id, "hsCode", e.target.value)}
                  />
                  <button
                    type="button"
                    className="bg-blue-100 text-blue-600 px-3 rounded-r-md border-t border-r border-b"
                    onClick={() => {
                      // In a real app, this would open a modal to search for HS codes
                      alert("HS Code lookup functionality would be implemented here")
                    }}
                  >
                    Fetch Rate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country of Origin</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={material.countryOfOrigin}
                  onChange={(e) => handleMaterialChange(material.id, "countryOfOrigin", e.target.value)}
                  required
                >
                  <option value="">Select country</option>
                  <option value="US">United States</option>
                  <option value="CN">China</option>
                  <option value="CA">Canada</option>
                  <option value="MX">Mexico</option>
                  <option value="JP">Japan</option>
                  <option value="DE">Germany</option>
                  <option value="UK">United Kingdom</option>
                  <option value="FR">France</option>
                  <option value="IN">India</option>
                  <option value="BR">Brazil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit (CAD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-2 pl-7 border rounded-md"
                    placeholder="0.00"
                    value={material.costPerUnit || ""}
                    onChange={(e) =>
                      handleMaterialChange(material.id, "costPerUnit", Number.parseFloat(e.target.value) || 0)
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Used</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter quantity"
                  value={material.quantity || ""}
                  onChange={(e) => handleMaterialChange(material.id, "quantity", Number.parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tariff Rate</label>
                <div className="flex">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full p-2 border rounded-l-md"
                    placeholder="0.0"
                    value={material.tariffRate || ""}
                    onChange={(e) =>
                      handleMaterialChange(material.id, "tariffRate", Number.parseFloat(e.target.value) || 0)
                    }
                  />
                  <span className="bg-gray-100 text-gray-700 px-3 flex items-center justify-center rounded-r-md border-t border-r border-b">
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows="3"
                placeholder="Add any additional notes"
                value={material.notes}
                onChange={(e) => handleMaterialChange(material.id, "notes", e.target.value)}
              ></textarea>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          onClick={handleAddMaterial}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Material
        </button>

        <div className="flex justify-end">
          <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2">
            Back
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Continue to Product Configuration
          </button>
        </div>
      </form>
    </div>
  )
}
