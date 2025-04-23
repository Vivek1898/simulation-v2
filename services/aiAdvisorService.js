
// API Keys
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY
const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY

// API Models
const PERPLEXITY_MODEL = "sonar"
const GEMINI_MODEL = "gemini-2.0-flash"

// API Endpoints
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

// Function to query Perplexity AI
export async function queryPerplexity(prompt, context = null) {
    try {
        const messages = [
            {
                role: "system",
                content:
                    "You are TariffSim AI, an expert in international trade, tariffs, and supply chain optimization. Provide concise, accurate information about tariff rates, trade agreements, and optimization strategies. Your responses should be helpful, informative, and focused on helping users make better trade decisions.",
            },
            {
                role: "user",
                content: prompt,
            },
        ]

        // Add context if provided
        if (context) {
            messages.splice(1, 0, {
                role: "system",
                content: `Context information: ${JSON.stringify(context)}`,
            })
        }

        const response = await fetch(PERPLEXITY_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            },
            body: JSON.stringify({
                model: PERPLEXITY_MODEL,
                messages: messages,
                max_tokens: 1000,
            }),
        })

        if (!response.ok) {
            throw new Error(`Perplexity API error: ${response.status}`)
        }

        const data = await response.json()
        return data.choices[0].message.content
    } catch (error) {
        console.error("Error querying Perplexity:", error)
        return "I'm sorry, I encountered an error while processing your request. Please try again later."
    }
}

// Function to query Google Gemini
export async function queryGemini(prompt, context = null) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`

        let promptText = prompt
        if (context) {
            promptText = `Context: ${JSON.stringify(context)}\n\nUser query: ${prompt}`
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `You are TariffSim AI, an expert in international trade, tariffs, and supply chain optimization. 
                Provide concise, accurate information about tariff rates, trade agreements, and optimization strategies. 
                Your responses should be helpful, informative, and focused on helping users make better trade decisions.
                
                User query: ${promptText}`,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 1000,
                },
            }),
        })

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`)
        }

        const data = await response.json()
        return data.candidates[0].content.parts[0].text
    } catch (error) {
        console.error("Error querying Gemini:", error)
        return "I'm sorry, I encountered an error while processing your request. Please try again later."
    }
}

// Function to get AI response (tries Perplexity first, falls back to Gemini)
export async function getAIResponse(prompt, context = null) {
    try {
        // const response = await queryPerplexity(prompt, context)
        const response = await queryGemini(prompt, context)

        return response
    } catch (error) {
        console.error("Perplexity failed, falling back to Gemini:", error)
        try {
            const response = await queryGemini(prompt, context)
            return response
        } catch (geminiError) {
            console.error("Both AI services failed:", geminiError)
            return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later."
        }
    }
}

// Function to analyze simulation data and provide insights
export async function analyzeSimulation(simulationData) {
    const context = {
        product: simulationData.product,
        rawMaterials: simulationData.rawMaterials,
        markets: simulationData.tradeScenario?.markets || [],
        results: simulationData.results,
    }

    const prompt =
        "Based on the provided simulation data, identify potential optimization opportunities, tariff reduction strategies, and market insights. Focus on the most impactful recommendations."

    return await getAIResponse(prompt, context)
}

// Function to get suggested questions based on simulation data
export function getSuggestedQuestions(simulationData) {
    // Basic questions that are always relevant
    const basicQuestions = [
        "Compare tariff rates between USA and Mexico for my product",
        "What trade agreements apply to my current suppliers?",
        "Calculate potential savings with alternative suppliers",
    ]

    // Add more specific questions based on the simulation data
    const specificQuestions = []

    // If we have raw materials from high-tariff countries
    const highTariffMaterials = simulationData.rawMaterials?.filter((m) => m.tariffRate > 10) || []
    if (highTariffMaterials.length > 0) {
        specificQuestions.push(`Find alternative sources for ${highTariffMaterials[0].name} with lower tariffs`)
    }

    // If we have multiple markets
    if (simulationData.tradeScenario?.markets?.length > 1) {
        specificQuestions.push("Which market offers the best profit margin for my product?")
    }

    // Combine and return limited number of questions
    return [...specificQuestions, ...basicQuestions].slice(0, 5)
}
