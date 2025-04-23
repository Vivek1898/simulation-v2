"use client"

import { useState, useEffect, useRef } from "react"
import { getAIResponse, getSuggestedQuestions } from "../../services/aiAdvisorService"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function TariffSimAI({ simulationData, isExpanded = false, onClose }) {
    const [messages, setMessages] = useState([
        {
            role: "ai",
            content:
                "Based on your current scenario, I notice potential optimization opportunities in your US market tariff structure. Would you like me to analyze alternatives?",
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [suggestedQuestions, setSuggestedQuestions] = useState([])
    const [recentQueries, setRecentQueries] = useState([])
    const [isAdvancedMode, setIsAdvancedMode] = useState(false)
    const messagesEndRef = useRef(null)
    const chatContainerRef = useRef(null)

    useEffect(() => {
        // Generate suggested questions based on simulation data
        const questions = getSuggestedQuestions(simulationData)
        setSuggestedQuestions(questions)
    }, [simulationData])

    useEffect(() => {
        // Scroll to bottom when messages change
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSendMessage = async (messageText = input) => {
        if (!messageText.trim()) return

        // Add user message to chat
        const userMessage = { role: "user", content: messageText }
        setMessages((prev) => [...prev, userMessage])

        // Clear input and show loading state
        setInput("")
        setIsLoading(true)

        try {
            // Get AI response
            const response = await getAIResponse(messageText, simulationData)

            // Add AI response to chat
            setMessages((prev) => [...prev, { role: "ai", content: response }])

            // Add to recent queries if not already there
            setRecentQueries((prev) => {
                const newQuery = messageText.length > 30 ? messageText.substring(0, 30) + "..." : messageText
                return [newQuery, ...prev.filter((q) => q !== newQuery)].slice(0, 5)
            })
        } catch (error) {
            console.error("Error getting AI response:", error)
            setMessages((prev) => [...prev, { role: "ai", content: "I'm sorry, I encountered an error. Please try again." }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleSuggestedQuestion = (question) => {
        handleSendMessage(question)
    }

    // Custom renderer components for markdown
    const MarkdownComponents = {
        // Override the code block rendering
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline ? (
                <div className="bg-gray-900 rounded-md overflow-hidden my-2">
                    <div className="flex items-center px-4 py-2 bg-gray-800">
                        <span className="text-xs text-gray-400">{match ? match[1] : 'code'}</span>
                    </div>
                    <pre className="p-4 overflow-x-auto">
                        <code className={className} {...props}>
                            {children}
                        </code>
                    </pre>
                </div>
            ) : (
                <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
                    {children}
                </code>
            )
        },
        // Override table rendering
        table({ children }) {
            return (
                <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-gray-300 rounded">
                        {children}
                    </table>
                </div>
            )
        },
        tr({ children }) {
            return <tr className="border-b border-gray-300">{children}</tr>
        },
        th({ children }) {
            return <th className="px-4 py-2 bg-gray-100 text-left font-medium text-sm">{children}</th>
        },
        td({ children }) {
            return <td className="px-4 py-2 text-sm">{children}</td>
        },
        // Override list rendering
        ul({ children }) {
            return <ul className="list-disc ml-5 my-2 space-y-1 text-left">{children}</ul>
        },
        li({ children }) {
            return <li className="my-1">{children}</li>
        },
        ol({ children }) {
            return <ol className="list-decimal ml-5 my-2 space-y-1 text-left">{children}</ol>
        },
        // Override heading rendering
        h1({ children }) {
            return <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>
        },
        h2({ children }) {
            return <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>
        },
        h3({ children }) {
            return <h3 className="text-md font-bold mt-3 mb-1">{children}</h3>
        },
        p({ children }) {
            return <p className="my-2 text-left">{children}</p>
        }
    }

    return (
        <div
            className={`bg-white rounded-lg shadow ${isExpanded ? "fixed inset-0 z-50 m-4 md:m-8 overflow-hidden flex flex-col" : ""}`}
        >
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                    <div className="flex items-center mr-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold ml-2">TariffSim AI</h2>
                    </div>
                    <button
                        className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${isAdvancedMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}
                        onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                    >
                        Advanced Mode
                    </button>
                </div>
                {isExpanded && (
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            <div className={`flex ${isExpanded ? "flex-1 overflow-hidden" : ""}`}>
                <div
                    ref={chatContainerRef}
                    className={`${isExpanded ? "flex-1 overflow-y-auto p-4" : "p-4"} max-h-[500px] overflow-y-auto scroll-smooth w-full`}
                >
                    {messages.map((message, index) => (
                        <div key={index} className={`mb-6 ${message.role === "user" ? "" : ""}`}>
                            {message.role === "user" ? (
                                <div className="flex items-start justify-end gap-2">
                                    <div className="inline-block p-4 rounded-lg bg-blue-600 text-white rounded-br-none shadow-sm max-w-[85%]">
                                        <div>{message.content}</div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="inline-block p-4 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none shadow-sm max-w-[85%] w-full">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={MarkdownComponents}
                                            // className="prose prose-sm max-w-none overflow-auto"
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="bg-gray-100 text-gray-500 p-4 rounded-lg rounded-bl-none inline-flex items-center">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span className="ml-2">AI is thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {isExpanded && isAdvancedMode && (
                    <div className="w-72 border-l p-4 overflow-y-auto bg-gray-50">
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Suggested Questions</h3>
                            <ul className="space-y-2">
                                {suggestedQuestions.map((question, index) => (
                                    <li key={index}>
                                        <button
                                            className="text-left w-full p-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-200 border border-gray-200 bg-white"
                                            onClick={() => handleSuggestedQuestion(question)}
                                        >
                                            {question}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recent Queries</h3>
                            <ul className="space-y-2">
                                {recentQueries.map((query, index) => (
                                    <li key={index} className="flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <button
                                            className="text-left w-full text-sm text-gray-600 hover:text-blue-600 truncate"
                                            onClick={() => handleSuggestedQuestion(query)}
                                        >
                                            {query}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tools</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button className="flex items-center w-full p-2.5 text-sm bg-white border border-gray-200 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-200">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-gray-500 mr-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Duty Calculator
                                    </button>
                                </li>
                                <li>
                                    <button className="flex items-center w-full p-2.5 text-sm bg-white border border-gray-200 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-200">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-gray-500 mr-2"
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
                                        Export Chat
                                    </button>
                                </li>
                                <li>
                                    <button className="flex items-center w-full p-2.5 text-sm bg-white border border-gray-200 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-200">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-gray-500 mr-2"
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
                                        View Analytics
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t">
                <div className="relative">
                    <input
                        type="text"
                        className="w-full p-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition duration-200"
                        placeholder="Ask a question about your tariff simulation..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                    <button
                        className={`absolute right-2 top-2 p-2 rounded-md transition-colors duration-200
                            ${(!isLoading && input.trim())
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !input.trim()}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .typing-indicator {
                    display: flex;
                    align-items: center;
                }

                .typing-indicator span {
                    height: 8px;
                    width: 8px;
                    float: left;
                    margin: 0 2px;
                    background-color: #9880ff;
                    border-radius: 50%;
                    opacity: 0.4;
                    animation: typing 1s infinite alternate;
                }

                .typing-indicator span:nth-of-type(1) {
                    animation-delay: 0s;
                }

                .typing-indicator span:nth-of-type(2) {
                    animation-delay: 0.2s;
                }

                .typing-indicator span:nth-of-type(3) {
                    animation-delay: 0.4s;
                }

                @keyframes typing {
                    0% {
                        opacity: 0.4;
                        transform: translateY(0px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(-5px);
                    }
                }
            `}</style>
        </div>
    )
}