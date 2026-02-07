"use client";

import { Fragment, useState, useRef, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, MessageCircle, Phone, ArrowRight, Send, MapPin, Sparkles } from "lucide-react";
import { askKimHuongAI } from "../../services/aiService";

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    action?: "map";
}

export default function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Chào bạn! Nhà Kim Hương có thể giúp gì cho bạn hôm nay?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        // Add user message
        const userMsg: Message = { role: "user", content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Gọi AI DeepSeek qua Ngrok
            const aiReply = await askKimHuongAI(text);

            // Xử lý logic hiển thị map nếu AI trả về (giữ lại tính năng cũ nếu có)
            let content = aiReply;
            let action: "map" | undefined = undefined;

            // Nếu AI thông minh tự trả về [SHOW_MAP], ta vẫn hứng được
            if (content.includes("[SHOW_MAP]")) {
                action = "map";
                content = content.replace("[SHOW_MAP]", "").trim();
            }

            setMessages(prev => [...prev, { role: "assistant", content, action }]);
        } catch (error: any) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Dạ hiện tại em đang bị mất kết nối với 'Tổng đài'. Khách chờ xíu hoặc nhắn Zalo giúp em nha!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAsk = (tag: string) => {
        const queryMap: Record<string, string> = {
            "Địa chỉ shop": "Địa chỉ shop ở đâu ạ?",
            "Mẹt Tết": "Tư vấn cho mình về Mẹt tre trang trí Tết nhé",
            "Quà tặng": "Shop có set quà tặng nào đẹp không?",
            "Custom": "Mình muốn đặt làm riêng theo yêu cầu"
        };
        handleSend(queryMap[tag] || tag);
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-hidden">
                    <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="transform transition ease-in-out duration-300"
                            enterFrom="translate-y-full"
                            enterTo="translate-y-0"
                            leave="transform transition ease-in-out duration-300"
                            leaveFrom="translate-y-0"
                            leaveTo="translate-y-full"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-t-3xl bg-[#FDFBF7] text-left shadow-2xl transition-all w-full max-w-lg h-[80vh] sm:h-[600px] sm:rounded-2xl sm:p-4 border-t-4 border-orange-500 flex flex-col">
                                <div className="flex flex-col h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                                    {/* Handle bar */}
                                    <div className="flex justify-center pt-3 pb-1 sm:hidden w-full" onClick={onClose}>
                                        <div className="w-12 h-1.5 rounded-full bg-stone-300" />
                                    </div>

                                    {/* Header */}
                                    <div className="px-4 pb-2 flex justify-between items-center sm:pt-2 pt-1 border-b border-orange-100">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-orange-100 rounded-full text-orange-600">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-brand-brown font-serif">Trợ Lý Decor</h3>
                                                <p className="text-[10px] text-brand-terracotta flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                    Online | Powered by Gemini
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="rounded-full p-1 text-stone-400 hover:bg-stone-100 transition-colors"
                                            onClick={onClose}
                                        >
                                            <X className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>

                                    {/* Chat Area */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                                        {/* Contact Cards (Always at top or maybe just part of flow? Let's keep them handy) */}
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <a href="#" onClick={(e) => e.preventDefault()}
                                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors text-xs font-bold gap-1 cursor-default">
                                                <MessageCircle className="w-5 h-5" />
                                                Chat Zalo
                                            </a>
                                            <a href="#" onClick={(e) => e.preventDefault()}
                                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors text-xs font-bold gap-1 cursor-default">
                                                <Phone className="w-5 h-5" />
                                                Gọi Hotline
                                            </a>
                                        </div>

                                        {messages.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                                    ? 'bg-orange-500 text-white rounded-tr-none'
                                                    : 'bg-white border border-orange-100 text-stone-700 rounded-tl-none shadow-sm'
                                                    }`}>
                                                    <p>{msg.content}</p>

                                                    {msg.action === 'map' && (
                                                        <a
                                                            href="https://www.google.com/maps/search/?api=1&query=246+Tân+Hương,+Tân+Quý,+Tân+Phú"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-2 flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 p-2 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            <MapPin className="w-4 h-4 text-red-500" />
                                                            Mở Google Maps
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {isLoading && (
                                            <div className="flex justify-start">
                                                <div className="bg-white border border-orange-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                                    <div className="flex gap-1">
                                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-100" />
                                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-3 bg-white border-t border-orange-50">
                                        {/* Suggestions */}
                                        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                                            {["Địa chỉ shop", "Mẹt Tết", "Quà tặng", "Custom"].map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => handleQuickAsk(tag)}
                                                    className="px-3 py-1 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-100 whitespace-nowrap hover:bg-orange-100"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>

                                        <form
                                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="text"
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                placeholder="Nhập câu hỏi..."
                                                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isLoading || !input.trim()}
                                                className="p-2 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
