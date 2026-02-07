"use client";

import { Fragment, useState, useRef, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, MessageCircle, Phone, ArrowRight, Send, MapPin, Sparkles } from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import { askKimHuongAI } from "../../services/aiService";

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    context?: any;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    action?: "map";
}

interface ChatLog {
    session_id: string;
    role: "user" | "assistant";
    content: string;
}

// Helper Component to render basic Markdown (Bold & List)
const MarkdownMessage = ({ content, role }: { content: string, role: "user" | "assistant" }) => {
    return (
        <div className="space-y-2">
            {content.split('\n').map((line, idx) => {
                const trimmed = line.trim();

                // Handle Headers (###)
                if (trimmed.startsWith('###')) {
                    return <h4 key={idx} className="font-bold text-brand-terracotta text-sm uppercase tracking-wide pt-2 pb-1">{trimmed.replace(/#/g, '').trim()}</h4>;
                }

                // Handle Separators (---)
                if (trimmed === '---' || trimmed === '***') {
                    return <div key={idx} className="border-t border-dashed border-orange-200 my-2"></div>;
                }

                // Check list item
                const isList = trimmed.startsWith('-');
                const cleanLine = isList ? trimmed.substring(1).trim() : line;

                // Parse bold: **text**
                const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

                const renderedParts = parts.map((part, pIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={pIdx} className={role === 'assistant' ? "font-bold text-brand-brown" : "font-bold"}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                });

                if (isList) {
                    return (
                        <div key={idx} className="flex gap-2 items-start pl-1">
                            <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${role === 'assistant' ? 'bg-brand-terracotta' : 'bg-white'}`}></span>
                            <span className="flex-1 leading-relaxed text-sm">{renderedParts}</span>
                        </div>
                    );
                }

                if (!trimmed) return <div key={idx} className="h-1"></div>;

                return <p key={idx} className="leading-relaxed text-sm">{renderedParts}</p>;
            })}
        </div>
    );
};

export default function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Chào bạn! **Em Kim Hương** có thể giúp gì cho bạn hôm nay?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [sessionId, setSessionId] = useState("");
    const supabase = createClient();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Initialize Session ID & Load History
    useEffect(() => {
        let sid = localStorage.getItem("chat_session_id");
        if (!sid) {
            sid = crypto.randomUUID();
            localStorage.setItem("chat_session_id", sid);
        }
        setSessionId(sid || "");

        const loadHistory = async () => {
            if (!sid) return;
            const { data } = await supabase
                .from("chat_history")
                .select("role, content")
                .eq("session_id", sid)
                .order("created_at", { ascending: true });

            if (data && data.length > 0) {
                const history: Message[] = data.map((msg: any) => ({
                    role: msg.role,
                    content: msg.content
                }));
                setMessages([
                    { role: "assistant", content: "Chào bạn! **Em Kim Hương** có thể giúp gì cho bạn hôm nay?" },
                    ...history
                ]);
            }
        };
        loadHistory();
    }, []);

    const saveMessage = async (role: "user" | "assistant", content: string) => {
        if (!sessionId) return;
        try {
            await supabase.from("chat_history").insert({ session_id: sessionId, role, content });
        } catch (e) {
            console.error("Lỗi lưu chat:", e);
        }
    };

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Auto-resize Textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [input]);

    const handleSend = async () => {
        const text = input;
        if (!text.trim()) return;

        const userMsg: Message = { role: "user", content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        if (textareaRef.current) textareaRef.current.style.height = "auto"; // Reset height

        saveMessage("user", text);

        // Create new AbortController
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const aiReply = await askKimHuongAI(text, controller.signal);
            saveMessage("assistant", aiReply);

            let content = aiReply;
            let action: "map" | undefined = undefined;

            if (content.includes("[SHOW_MAP]")) {
                action = "map";
                content = content.replace("[SHOW_MAP]", "").trim();
            }

            setMessages(prev => [...prev, { role: "assistant", content, action }]);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log("Chat aborted by user");
                return;
            }
            console.error("Chat error:", error);
            const errorMsg = "Dạ hiện tại em đang bị mất kết nối với 'Tổng đài'. Khách chờ xíu hoặc nhắn Zalo giúp em nha!";
            setMessages(prev => [...prev, { role: "assistant", content: errorMsg }]);
            saveMessage("assistant", errorMsg);
        } finally {
            if (abortControllerRef.current === controller) {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        }
    };

    const handleEditLastMessage = () => {
        // 1. Abort current request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        // 2. Get last message (User's message)
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === 'user') {
            setInput(lastMsg.content); // Restore content to input
            setMessages(prev => prev.slice(0, -1)); // Remove from history
            setIsLoading(false); // Stop loading UI

            // Focus textarea
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    // Resize textarea to fit content
                    textareaRef.current.style.height = "auto";
                    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
                }
            }, 0);
        }
    };

    const handleQuickAsk = (tag: string) => {
        const queryMap: Record<string, string> = {
            "Địa chỉ shop": "Địa chỉ shop ở đâu ạ?",
            "Mẹt Tết": "Tư vấn cho mình về Mẹt tre trang trí Tết nhé",
            "Quà tặng": "Shop có set quà tặng nào đẹp không?",
            "Custom": "Mình muốn đặt làm riêng theo yêu cầu"
        };
        const text = queryMap[tag] || tag;

        // Simulating send for quick actions
        const userMsg: Message = { role: "user", content: text };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        saveMessage("user", text);

        // Call API logic duplicated here to reuse handleSend logic slightly refactored would be better but keeping it simple for now
        // actually let's re-use handleSend but we need to modify handleSend to accept arg or use state.
        // Let's refactor handleSend to accept text argument?
        // The previous implementation had `handleSend(text)` but current one uses state `input`.
        // Let's defer to a shared internal function.

        (async () => {
            try {
                const aiReply = await askKimHuongAI(text);
                saveMessage("assistant", aiReply);
                let content = aiReply;
                let action: "map" | undefined = undefined;
                if (content.includes("[SHOW_MAP]")) {
                    action = "map";
                    content = content.replace("[SHOW_MAP]", "").trim();
                }
                setMessages(prev => [...prev, { role: "assistant", content, action }]);
            } catch (error: any) {
                const errorMsg = "Dạ hiện tại em đang bị mất kết nối. Khách nhắn Zalo giúp em nha!";
                setMessages(prev => [...prev, { role: "assistant", content: errorMsg }]);
                saveMessage("assistant", errorMsg);
            } finally {
                setIsLoading(false);
            }
        })();
    };

    // Allow Enter to submit, Shift+Enter for new line
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-t-3xl bg-[#FDFBF7] text-left shadow-2xl transition-all w-full max-w-lg h-[90vh] sm:h-[650px] sm:rounded-2xl border-t-4 border-orange-500 flex flex-col">
                                <div className="flex flex-col h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">

                                    {/* Header */}
                                    <div className="px-4 py-3 flex justify-between items-center border-b border-orange-100 bg-[#FDFBF7]/90 backdrop-blur-sm shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                                                    <Sparkles className="w-5 h-5" />
                                                </div>
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-brand-brown font-serif leading-none">Trợ Lý Decor</h3>
                                                <p className="text-xs text-brand-terracotta mt-1">Em Kim Hương (AI) đang online</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 transition-colors"
                                            onClick={onClose}
                                        >
                                            <X className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>

                                    {/* Chat Area */}
                                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 scroll-smooth" ref={scrollRef}>
                                        {messages.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end items-end gap-2' : 'justify-start'}`}>
                                                {/* Edit Button for User Message (Only for the last message & while loading) */}
                                                {isLoading && msg.role === 'user' && idx === messages.length - 1 && (
                                                    <button
                                                        onClick={handleEditLastMessage}
                                                        className="mb-1 p-1 text-xs text-stone-400 hover:text-orange-600 transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        Sửa
                                                    </button>
                                                )}

                                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${msg.role === 'user'
                                                    ? 'bg-orange-500 text-white rounded-tr-none'
                                                    : 'bg-white border border-orange-100 text-stone-700 rounded-tl-none'
                                                    }`}>
                                                    <MarkdownMessage content={msg.content} role={msg.role} />
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
                                                <div className="bg-white border border-orange-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                                                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />
                                                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-100" />
                                                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-200" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sticky Footer: Suggestions, Contact & Input */}
                                    <div className="bg-white border-t border-orange-50 shrink-0">

                                        {/* Quick Actions (Suggestions) */}
                                        <div className="px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-b border-orange-50/50">
                                            {["Địa chỉ shop", "Mẹt Tết", "Quà tặng", "Custom"].map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => handleQuickAsk(tag)}
                                                    className="px-3 py-1.5 bg-stone-100 text-stone-600 text-xs font-medium rounded-full border border-stone-200 whitespace-nowrap hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Contact Buttons (Sticky) */}
                                        <div className="grid grid-cols-2 gap-3 px-3 py-2">
                                            <a href="https://zalo.me/0938123456" target="_blank" rel="noreferrer" // Replace with real Zalo link
                                                className="flex items-center justify-center p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors text-xs font-bold gap-2">
                                                <MessageCircle className="w-4 h-4" />
                                                Chat Zalo
                                            </a>
                                            <a href="tel:0938123456" // Replace with real Hotline
                                                className="flex items-center justify-center p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors text-xs font-bold gap-2">
                                                <Phone className="w-4 h-4" />
                                                Gọi Hotline
                                            </a>
                                        </div>

                                        {/* Input Area - Simplified */}
                                        <div className="p-3 pt-1">
                                            <div className="flex gap-2 items-center bg-stone-100/50 rounded-2xl px-3 py-2">
                                                <textarea
                                                    ref={textareaRef}
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="Nhập câu hỏi... (Shift+Enter xuống dòng)"
                                                    rows={1}
                                                    className="flex-1 bg-transparent border-none text-sm resize-none focus:ring-0 p-0 max-h-32 text-stone-800 placeholder-stone-400 leading-relaxed"
                                                    style={{ minHeight: '20px' }}
                                                />
                                                <button
                                                    onClick={handleSend}
                                                    disabled={isLoading || !input.trim()}
                                                    className="p-1.5 bg-orange-500 text-white rounded-full shadow-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
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
