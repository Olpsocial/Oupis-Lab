"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, MapPin } from "lucide-react";
import Image from "next/image";

interface StoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function StoryModal({ isOpen, onClose }: StoryModalProps) {
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
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-[#FDFBF7] text-left align-middle shadow-xl transition-all border border-orange-200">
                                {/* Image Section */}
                                <div className="relative h-48 sm:h-64 w-full">
                                    <Image
                                        src="/assets/products/tet-1.jpg" // Using tet-1 as a fallback for shop image
                                        alt="Nhà Kim Hương Shop"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                        <h3 className="text-white font-serif font-bold text-2xl p-6 drop-shadow-md">
                                            Nhà Kim Hương
                                        </h3>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 md:p-8">
                                    <h2 className="text-xl font-bold text-brand-brown mb-4 font-serif text-center">
                                        Gìn Giữ Hồn Tết Việt
                                    </h2>

                                    <div className="space-y-4 text-stone-600 leading-relaxed text-sm md:text-base text-justify">
                                        <p>
                                            Chào bạn, <strong>Nhà Kim Hương</strong> là cửa hàng thủ công mỹ nghệ lâu đời tại
                                            <strong> Tân Phú</strong>.
                                        </p>
                                        <p>
                                            Chúng mình chuyên cung cấp lồng đèn, mẹt tre và đồ trang trí Tết với hơn
                                            <strong> 3 năm kinh nghiệm</strong> tư vấn decor thực chiến cho hàng trăm ngôi nhà và văn phòng.
                                        </p>
                                        <p>
                                            Mỗi sản phẩm đều được tuyển chọn kỹ lưỡng hoặc tự tay hoàn thiện, gửi gắm trọn vẹn không khí Tết ấm cúng đến gia đình bạn.
                                        </p>
                                    </div>

                                    <div className="mt-8">
                                        <a
                                            href="https://www.google.com/maps/search/?api=1&query=246+Tân+Hương,+Tân+Quý,+Tân+Phú"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-700 hover:-translate-y-0.5 transition-all"
                                        >
                                            <MapPin className="w-5 h-5" />
                                            Xem đường đi
                                        </a>
                                        <p className="mt-3 text-center text-xs text-stone-400">
                                            Địa chỉ: 246 Tân Hương, Tân Quý, Tân Phú
                                        </p>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
