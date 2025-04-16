import { openDB } from "idb"

// Initialize IndexedDB
const initDB = async () => {
  return openDB("tariffSimDB", 1, {
    upgrade(db) {
      // Create a store for simulations
      if (!db.objectStoreNames.contains("simulations")) {
        const simulationStore = db.createObjectStore("simulations", {
          keyPath: "id",
          autoIncrement: true,
        })
        simulationStore.createIndex("createdAt", "createdAt")
        simulationStore.createIndex("name", "name")
        simulationStore.createIndex("status", "status")
        simulationStore.createIndex("type", "type")
      }
    },
  })
}

// Get all simulations
export const getAllSimulations = async () => {
  try {
    const db = await initDB()
    const simulations = await db.getAll("simulations")

    // If no simulations exist, create sample data
    if (simulations.length === 0) {
      const sampleData = generateSampleData()
      for (const sample of sampleData) {
        await saveSimulation(sample)
      }
      return sampleData
    }

    return simulations
  } catch (error) {
    console.error("Error getting simulations:", error)
    return []
  }
}

// Get a simulation by ID
export const getSimulationById = async (id) => {
  try {
    const db = await initDB()
    return await db.get("simulations", id)
  } catch (error) {
    console.error(`Error getting simulation ${id}:`, error)
    return null
  }
}

// Save a simulation
export const saveSimulation = async (simulationData) => {
  try {
    const db = await initDB()

    // Prepare the simulation data
    const simulation = {
      ...simulationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Draft",
      name: simulationData.product?.name || "Untitled Simulation",
      hsCode: simulationData.product?.hsCode || "N/A",
      type: simulationData.tradeScenario?.saleLocation || "Domestic",
      // Add calculated fields for display in the dashboard
      rawMaterials: simulationData.results?.rawMaterialsCost || 0,
      processing: simulationData.results?.processingCost || 0,
      tariffs: simulationData.results?.tariffCost || 0,
      totalCost: simulationData.results?.totalCost || 0,
    }

    // Save to IndexedDB
    const id = await db.add("simulations", simulation)

    // Return the saved simulation with its ID
    return { ...simulation, id }
  } catch (error) {
    console.error("Error saving simulation:", error)
    throw error
  }
}

// Update a simulation
export const updateSimulation = async (id, simulationData) => {
  try {
    const db = await initDB()

    // Get the existing simulation
    const existingSimulation = await db.get("simulations", id)
    if (!existingSimulation) {
      throw new Error(`Simulation with ID ${id} not found`)
    }

    // Prepare the updated simulation data
    const updatedSimulation = {
      ...existingSimulation,
      ...simulationData,
      updatedAt: new Date().toISOString(),
    }

    // Update in IndexedDB
    await db.put("simulations", updatedSimulation)

    return updatedSimulation
  } catch (error) {
    console.error(`Error updating simulation ${id}:`, error)
    throw error
  }
}

// Delete a simulation
export const deleteSimulation = async (id) => {
  try {
    const db = await initDB()
    await db.delete("simulations", id)
    return true
  } catch (error) {
    console.error(`Error deleting simulation ${id}:`, error)
    throw error
  }
}

// Generate sample data for the dashboard
const generateSampleData = () => {
  return [
    {
      id: 1,
      name: "Electronic Components Assembly",
      hsCode: "8542.31",
      status: "Completed",
      type: "Export",
      createdAt: new Date("2025-03-15").toISOString(),
      rawMaterials: 12450,
      processing: 5230,
      tariffs: 2890,
      totalCost: 20570,
    },
    {
      id: 2,
      name: "Automotive Parts",
      hsCode: "8708.99",
      status: "Draft",
      type: "Domestic",
      createdAt: new Date("2025-03-12").toISOString(),
      rawMaterials: 8750,
      processing: 3420,
      tariffs: 1890,
      totalCost: 14060,
    },
    {
      id: 3,
      name: "Textile Manufacturing",
      hsCode: "5208.52",
      status: "Completed",
      type: "Export",
      createdAt: new Date("2025-03-10").toISOString(),
      rawMaterials: 15320,
      processing: 5780,
      tariffs: 3450,
      totalCost: 24550,
    },
  ]
}
