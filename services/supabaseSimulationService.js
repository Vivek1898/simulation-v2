import { getSupabase } from "../lib/supabase"

// Get all simulations for the current user
export const getAllSimulations = async () => {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase.from("simulations").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error getting simulations:", error)
    return []
  }
}

// Get a simulation by ID
export const getSimulationById = async (id) => {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase.from("simulations").select("*").eq("id", id).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error(`Error getting simulation ${id}:`, error)
    return null
  }
}

// Save a simulation
export const saveSimulation = async (simulationData) => {
  try {
    const supabase = getSupabase()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")

    // Prepare the simulation data
    const simulation = {
      user_id: user.id,
      name: simulationData.product?.name || "Untitled Simulation",
      hs_code: simulationData.product?.hsCode || "N/A",
      status: "Draft",
      type: simulationData.tradeScenario?.saleLocation || "Domestic",
      raw_materials: simulationData.results?.rawMaterialsCost || 0,
      processing: simulationData.results?.processingCost || 0,
      tariffs: simulationData.results?.tariffCost || 0,
      total_cost: simulationData.results?.totalCost || 0,
      simulation_data: simulationData,
    }

    // Save to Supabase
    const { data, error } = await supabase.from("simulations").insert([simulation]).select()

    if (error) throw error

    return data[0]
  } catch (error) {
    console.error("Error saving simulation:", error)
    throw error
  }
}

// Update a simulation
export const updateSimulation = async (id, simulationData) => {
  try {
    const supabase = getSupabase()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")

    // Get the existing simulation
    const { data: existingSimulation, error: fetchError } = await supabase
      .from("simulations")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError

    if (!existingSimulation) {
      throw new Error(`Simulation with ID ${id} not found`)
    }

    // Prepare the updated simulation data
    const updatedSimulation = {
      name: simulationData.product?.name || existingSimulation.name,
      hs_code: simulationData.product?.hsCode || existingSimulation.hs_code,
      status: simulationData.status || existingSimulation.status,
      type: simulationData.tradeScenario?.saleLocation || existingSimulation.type,
      raw_materials: simulationData.results?.rawMaterialsCost || existingSimulation.raw_materials,
      processing: simulationData.results?.processingCost || existingSimulation.processing,
      tariffs: simulationData.results?.tariffCost || existingSimulation.tariffs,
      total_cost: simulationData.results?.totalCost || existingSimulation.total_cost,
      simulation_data: {
        ...existingSimulation.simulation_data,
        ...simulationData,
      },
      updated_at: new Date().toISOString(),
    }

    // Update in Supabase
    const { data, error } = await supabase.from("simulations").update(updatedSimulation).eq("id", id).select()

    if (error) throw error

    return data[0]
  } catch (error) {
    console.error(`Error updating simulation ${id}:`, error)
    throw error
  }
}

// Delete a simulation
export const deleteSimulation = async (id) => {
  try {
    const supabase = getSupabase()

    const { error } = await supabase.from("simulations").delete().eq("id", id)

    if (error) throw error

    return true
  } catch (error) {
    console.error(`Error deleting simulation ${id}:`, error)
    throw error
  }
}

// Save comparison session
export const saveComparisonSession = async (simulationIds) => {
  try {
    const supabase = getSupabase()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("comparison_sessions")
      .insert([
        {
          user_id: user.id,
          simulation_ids: simulationIds,
        },
      ])
      .select()

    if (error) throw error

    return data[0]
  } catch (error) {
    console.error("Error saving comparison session:", error)
    throw error
  }
}

// Get simulations by IDs for comparison
export const getSimulationsForComparison = async (simulationIds) => {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase.from("simulations").select("*").in("id", simulationIds)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error getting simulations for comparison:", error)
    return []
  }
}
