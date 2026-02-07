"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Header from "../components/header";
import { Loader2, ArrowRight, Mail, Lock, Phone, MessageSquare, CheckCircle2, User } from "lucide-react";

// Schemas
const loginSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const phoneSchema = z.object({
    phone: z.string().min(10, "Số điện thoại không hợp lệ").regex(/^[0-9]+$/, "Chỉ được nhập số"),
});

const otpSchema = z.object({
    otp: z.string().length(6, "Mã OTP gồm 6 chữ số"),
});

const registerSchema = z.object({
    fullName: z.string().min(2, "Họ tên quá ngắn"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export default function AuthPage() {
    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
    const [mode, setMode] = useState<"login" | "register">("login");
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");

    const router = useRouter();
    const supabase = createClient();

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
    });

    const phoneForm = useForm<z.infer<typeof phoneSchema>>({
        resolver: zodResolver(phoneSchema),
    });

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
    });

    const registerForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
    });

    // --- EMAIL AUTH ---
    const onEmailLogin = async (data: z.infer<typeof loginSchema>) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });
            if (error) throw error;
            toast.success("Đăng nhập thành công!");
            router.push("/checkout"); // Redirect to checkout as it's the current context
            router.refresh();
        } catch (e: any) {
            toast.error("Lỗi: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onEmailRegister = async (data: z.infer<typeof registerSchema>) => {
        setIsLoading(true);
        try {
            const { error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                    }
                }
            });

            if (authError) throw authError;

            toast.success("Đăng ký thành công! Vui lòng kiểm tra Email để xác nhận tài khoản trước khi đăng nhập.", {
                duration: 6000
            });

            // Chuyển về tab đăng nhập để user sẵn sàng sau khi confirm mail
            setMode("login");
        } catch (e: any) {
            toast.error("Lỗi đăng ký: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- PHONE OTP AUTH ---
    const onSendOTP = async (data: z.infer<typeof phoneSchema>) => {
        setIsLoading(true);
        try {
            // Chuẩn hóa số điện thoại sang định dạng quốc tế (VN là +84)
            const formattedPhone = data.phone.startsWith('0')
                ? '+84' + data.phone.slice(1)
                : data.phone.startsWith('+84') ? data.phone : '+84' + data.phone;

            const { error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
            });

            if (error) throw error;

            setPhoneNumber(formattedPhone);
            setOtpSent(true);
            toast.success("Mã xác minh đã được gửi!");
        } catch (e: any) {
            toast.error("Không thể gửi mã: " + (e.message.includes("provider") ? "Chưa cấu hình SMS Provider trên Supabase" : e.message));
        } finally {
            setIsLoading(false);
        }
    };

    const onVerifyOTP = async (data: z.infer<typeof otpSchema>) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                phone: phoneNumber,
                token: data.otp,
                type: 'sms',
            });

            if (error) throw error;

            toast.success("Xác minh thành công!");
            router.push("/shop");
            router.refresh();
        } catch (e: any) {
            toast.error("Mã OTP không chính xác hoặc đã hết hạn");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-body flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-orange-100">

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold font-hand text-brand-brown mb-2">
                            Chào mừng bạn!
                        </h1>
                        <p className="text-stone-500 text-sm">
                            Lưu giữ giỏ hàng và theo dõi đơn hàng dễ dàng hơn.
                        </p>
                    </div>

                    {/* Tab Đăng nhập / Đăng ký */}
                    <div className="flex bg-stone-100 p-1 rounded-xl mb-6 relative">
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ${mode === 'login' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                        />
                        <button
                            onClick={() => setMode("login")}
                            className={`flex-1 relative z-10 py-2 text-sm font-bold text-center transition-colors ${mode === "login" ? "text-brand-brown" : "text-stone-400"}`}
                        >
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => setMode("register")}
                            className={`flex-1 relative z-10 py-2 text-sm font-bold text-center transition-colors ${mode === "register" ? "text-brand-brown" : "text-stone-400"}`}
                        >
                            Đăng ký
                        </button>
                    </div>

                    {/* Phương thức: Email vs Phone (Chỉ hiện khi Đăng nhập) */}
                    {mode === 'login' && !otpSent && (
                        <div className="flex justify-center gap-6 mb-8">
                            <button
                                onClick={() => setAuthMethod("email")}
                                className={`text-xs font-bold transition-all ${authMethod === 'email' ? 'text-brand-terracotta border-b-2 border-brand-terracotta pb-1' : 'text-stone-400'}`}
                            >
                                Dùng Email
                            </button>
                            <button
                                onClick={() => setAuthMethod("phone")}
                                className={`text-xs font-bold transition-all ${authMethod === 'phone' ? 'text-brand-terracotta border-b-2 border-brand-terracotta pb-1' : 'text-stone-400'}`}
                            >
                                Dùng Số điện thoại
                            </button>
                        </div>
                    )}

                    {/* Forms */}
                    <div className="space-y-4">
                        {mode === "login" && authMethod === "email" ? (
                            // EMAIL LOGIN FORM
                            <form onSubmit={loginForm.handleSubmit(onEmailLogin)} className="space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-brand-brown ml-1">Email</label>
                                    <div className="relative">
                                        <input
                                            {...loginForm.register("email")}
                                            type="email"
                                            placeholder="example@mail.com"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-brand-terracotta transition-all"
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-brand-brown ml-1">Mật khẩu</label>
                                    <div className="relative">
                                        <input
                                            {...loginForm.register("password")}
                                            type="password"
                                            placeholder="••••••"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-brand-terracotta transition-all"
                                        />
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-brand-terracotta text-white font-bold py-3.5 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Đăng nhập"}
                                </button>
                            </form>
                        ) : mode === "register" ? (
                            // REGISTER FORM
                            <form onSubmit={registerForm.handleSubmit(onEmailRegister)} className="space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-brand-brown ml-1">Họ và tên</label>
                                    <div className="relative">
                                        <input
                                            {...registerForm.register("fullName")}
                                            type="text"
                                            placeholder="Nguyễn Văn A"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-brand-terracotta transition-all"
                                        />
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    </div>
                                    {registerForm.formState.errors.fullName && <p className="text-[10px] text-red-500 ml-1">{registerForm.formState.errors.fullName.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-brand-brown ml-1">Email</label>
                                    <div className="relative">
                                        <input
                                            {...registerForm.register("email")}
                                            type="email"
                                            placeholder="example@mail.com"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-brand-terracotta transition-all"
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    </div>
                                    {registerForm.formState.errors.email && <p className="text-[10px] text-red-500 ml-1">{registerForm.formState.errors.email.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-brand-brown ml-1">Mật khẩu</label>
                                    <div className="relative">
                                        <input
                                            {...registerForm.register("password")}
                                            type="password"
                                            placeholder="Tối thiểu 6 ký tự"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-brand-terracotta transition-all"
                                        />
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    </div>
                                    {registerForm.formState.errors.password && <p className="text-[10px] text-red-500 ml-1">{registerForm.formState.errors.password.message}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#2D2A26] text-white font-bold py-3.5 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Tạo tài khoản ngay"}
                                </button>
                            </form>
                        ) : (
                            // OTP FORM (Only for login)
                            <div className="animate-in fade-in duration-300">
                                {!otpSent ? (
                                    <form onSubmit={phoneForm.handleSubmit(onSendOTP)} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-brand-brown ml-1">Số điện thoại</label>
                                            <div className="relative">
                                                <input
                                                    {...phoneForm.register("phone")}
                                                    type="tel"
                                                    placeholder="09xx xxx xxx"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-brand-terracotta transition-all"
                                                />
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-brand-terracotta text-white font-bold py-3.5 rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" /> : "Gửi mã xác minh"}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-4">
                                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl mb-4 text-center">
                                            <MessageSquare className="text-brand-terracotta mx-auto mb-2" size={24} />
                                            <p className="text-xs text-brand-brown">Mã xác minh gồm 6 số đã được gửi tới</p>
                                            <p className="font-bold text-brand-terracotta">{phoneNumber}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-brand-brown ml-1">Mã OTP</label>
                                            <input
                                                {...otpForm.register("otp")}
                                                type="text"
                                                placeholder="123456"
                                                maxLength={6}
                                                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-brand-terracotta text-center text-2xl font-bold tracking-[0.5em]"
                                                autoFocus
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> Xác minh & Đăng nhập</>}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => { setOtpSent(false); otpForm.reset(); }}
                                            className="w-full text-xs text-stone-400 font-bold hover:text-brand-terracotta py-2"
                                        >
                                            Thay đổi số điện thoại
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                        <p className="text-xs text-stone-400 flex items-center justify-center gap-2">
                            <Lock size={12} /> Thông tin của bạn được bảo mật tuyệt đối
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
