"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import type { Product } from "@/data/mock-products";

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function OrderModal({ isOpen, onClose, product }: OrderModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        note: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle order submission here (e.g., send to API or Zalo)
        const message = `Đơn hàng mới:\nSản phẩm: ${product?.name}\nTên: ${formData.name}\nSĐT: ${formData.phone}\nĐ/c: ${formData.address}\nGhi chú: ${formData.note}`;

        // For now, let's just alert and close, or maybe redirect to Zalo
        // Using Zalo link format: https://zalo.me/PHONE?text=MESSAGE
        // But encoding long text might be tricky. Let's just alert for the demo.
        alert("Cảm ơn bạn đã đặt hàng! Chúng mình sẽ liên hệ sớm ạ.");
        onClose();
    };

    if (!product) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
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
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-orange-100">
                                <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-bold leading-6 text-brand-brown"
                                    >
                                        Đặt mua ngay
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-stone-400 hover:text-stone-600 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mb-6 flex gap-4 bg-orange-50 p-3 rounded-xl">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-orange-100">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-brown text-sm line-clamp-2">
                                            {product.name}
                                        </h4>
                                        <p className="text-brand-terracotta font-bold text-sm mt-1">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(product.price)}
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">
                                            Tên của bạn
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50 focus:border-brand-terracotta text-sm"
                                            placeholder="Nhập tên..."
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50 focus:border-brand-terracotta text-sm"
                                            placeholder="Nhập số điện thoại..."
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({ ...formData, phone: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">
                                            Địa chỉ nhận hàng (nếu có)
                                        </label>
                                        <textarea
                                            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50 focus:border-brand-terracotta text-sm"
                                            placeholder="Nhập địa chỉ..."
                                            rows={2}
                                            value={formData.address}
                                            onChange={(e) =>
                                                setFormData({ ...formData, address: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            className="w-full text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-200 hover:brightness-110 active:scale-95 transition-all text-sm"
                                            style={{ background: "var(--btn-gradient)" }}
                                        >
                                            Xác nhận đặt hàng
                                        </button>
                                        <p className="text-xs text-center text-stone-400 mt-2">
                                            Nhà Kim Hương sẽ liên hệ lại để chốt đơn nhé!
                                        </p>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
