import { useState } from "react"
import { HelpCircle, ChevronDown } from "lucide-react"

export default function HelpChatbot() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                    <HelpCircle className="h-6 w-6 text-white" />
                </button>
            ) : (
                <div className="bg-white rounded-lg shadow-xl w-[380px] overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-lg font-semibold text-white">Ask Docurate</h4>
                                <p className="text-sm text-purple-100">Get AI-powered help</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                            >
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="h-[500px] overflow-hidden relative">
                        {/* Optional loading gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-blue-50 pointer-events-none" />
                        <iframe
                            src="https://www.chatbase.co/chatbot-iframe/HKzAfP3SVM1jc2e7bg-C6"
                            width="100%"
                            height="100%"
                            className="w-full h-full relative z-10"
                            title="Chatbase Chatbot"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

