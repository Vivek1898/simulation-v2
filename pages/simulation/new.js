"use client"

import { useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import StepIndicator from "../../components/StepIndicator"
import RawMaterialsForm from "../../components/simulation/RawMaterialsForm"
import ProductConfigForm from "../../components/simulation/ProductConfigForm"
import TradeScenarioForm from "../../components/simulation/TradeScenarioForm"
import ResultsDashboard from "../../components/simulation/ResultsDashboard"
import { saveSimulation } from "../../services/supabaseSimulationService"
import { useAuth } from "../../contexts/AuthContext"

export default function NewSimulation() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [simulationData, setSimulationData] = useState({
    rawMaterials: [],
    product: {
      name: "",
      hsCode: "",
      assemblyLocation: "",
      processingCost: 0,
      additionalCosts: 0,
    },
    tradeScenario: {
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
    results: null,
  })

  const steps = [
    { id: 1, name: "Raw Materials", href: "#" },
    { id: 2, name: "Product Configuration", href: "#" },
    { id: 3, name: "Trade Scenario", href: "#" },
    { id: 4, name: "Results", href: "#" },
  ]

  const handleRawMaterialsSubmit = (rawMaterials) => {
    setSimulationData((prev) => ({ ...prev, rawMaterials }))
    setCurrentStep(2)
  }

  const handleProductConfigSubmit = (product) => {
    setSimulationData((prev) => ({ ...prev, product }))
    setCurrentStep(3)
  }

  const handleTradeScenarioSubmit = (tradeScenario) => {
    // Calculate results based on all inputs
    const rawMaterialsCost = simulationData.rawMaterials.reduce(
      (sum, material) => sum + material.costPerUnit * material.quantity,
      0,
    )

    const tariffCost = simulationData.rawMaterials.reduce(
      (sum, material) => sum + (material.costPerUnit * material.quantity * material.tariffRate) / 100,
      0,
    )

    const processingCost = simulationData.product.processingCost
    const additionalCosts = simulationData.product.additionalCosts

    const totalCost = rawMaterialsCost + processingCost + additionalCosts + tariffCost
    const totalRevenue = tradeScenario.sellingPrice
    const grossMargin = ((totalRevenue - totalCost) / totalRevenue) * 100

    const results = {
      rawMaterialsCost,
      processingCost,
      additionalCosts,
      tariffCost,
      totalCost,
      totalRevenue,
      grossMargin,
      netProfit: totalRevenue - totalCost,
    }

    setSimulationData((prev) => ({
      ...prev,
      tradeScenario,
      results,
    }))

    setCurrentStep(4)
  }

  const handleSaveSimulation = async () => {
    try {
      setIsSaving(true)
      const savedSimulation = await saveSimulation(simulationData)
      router.push(`/simulation/${savedSimulation.id}`)
    } catch (error) {
      console.error("Failed to save simulation:", error)
      alert("Failed to save simulation. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveScenario = async () => {
    try {
      setIsSaving(true)
      await saveSimulation(simulationData)
      alert("Simulation saved successfully!")
    } catch (error) {
      console.error("Failed to save scenario:", error)
      alert("Failed to save simulation. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    // Export functionality
    console.log("Exporting simulation data...")
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <RawMaterialsForm initialData={simulationData.rawMaterials} onSubmit={handleRawMaterialsSubmit} />
      case 2:
        return (
          <ProductConfigForm
            initialData={simulationData.product}
            rawMaterials={simulationData.rawMaterials}
            onSubmit={handleProductConfigSubmit}
            onBack={() => setCurrentStep(1)}
          />
        )
      case 3:
        return (
          <TradeScenarioForm
            initialData={simulationData.tradeScenario}
            productData={simulationData.product}
            rawMaterialsData={simulationData.rawMaterials}
            onSubmit={handleTradeScenarioSubmit}
            onBack={() => setCurrentStep(2)}
          />
        )
      case 4:
        return (
          <ResultsDashboard
            results={simulationData.results}
            simulationData={simulationData}
            onSaveScenario={handleSaveScenario}
            onExport={handleExport}
          />
        )
      default:
        return null
    }
  }

  return (
    <Layout>
      <Head>
        <title>New Simulation - TariffSim</title>
      </Head>

      <div className="p-6 max-w-7xl mx-auto">
        {currentStep < 4 ? (
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {currentStep === 1 && "Define Raw Materials"}
              {currentStep === 2 && "Final Product Configuration"}
              {currentStep === 3 && "Sales & Trade Scenario"}
            </h1>
            <button className="text-blue-600 flex items-center gap-1" onClick={handleSaveScenario} disabled={isSaving}>
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
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
                  Save Draft
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Results Dashboard</h1>
            <div className="flex gap-2">
              <button
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-1"
                onClick={handleSaveScenario}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
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
                    Save Scenario
                  </>
                )}
              </button>
              <button
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-1"
                onClick={handleExport}
                disabled={isSaving}
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
        )}

        <StepIndicator steps={steps} currentStep={currentStep} />

        <div className="mt-8">{renderStepContent()}</div>
      </div>
    </Layout>
  )
}
