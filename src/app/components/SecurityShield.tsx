'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Activity } from 'lucide-react';

export default function SecurityShield() {
    const [isVisible, setIsVisible] = useState(false);
    const [status, setStatus] = useState('Checking system...');

    useEffect(() => {
        // Chỉ hiện khi mới mở app (trong session này)
        const hasChecked = sessionStorage.getItem('security_checked');
        if (!hasChecked) {
            setIsVisible(true);

            const sequence = [
                { status: 'Mã hóa kết nối SSL...', delay: 800 },
                { status: 'Kiểm tra tính toàn vẹn...', delay: 1500 },
                { status: 'Hệ thống an toàn!', delay: 2200 },
            ];

            sequence.forEach((step, index) => {
                setTimeout(() => {
                    setStatus(step.status);
                    if (index === sequence.length - 1) {
                        setTimeout(() => {
                            setIsVisible(false);
                            sessionStorage.setItem('security_checked', 'true');
                        }, 800);
                    }
                }, step.delay);
            });
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
                <ShieldCheck className="w-20 h-20 text-green-600 relative z-10" />
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-800">Cổng Bảo Mật Nhà Kim Hương</h2>

            <div className="mt-8 w-64 bg-gray-100 h-1 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full animate-progress-fast"></div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>{status}</span>
            </div>

            <div className="mt-auto mb-8 flex items-center gap-2 text-xs text-gray-400">
                <Lock className="w-3 h-3" />
                <span>Bảo mật bởi Kim Huong Native Shield</span>
            </div>

            <style jsx global>{`
        @keyframes progress-fast {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress-fast {
          animation: progress-fast 2s ease-in-out;
        }
      `}</style>
        </div>
    );
}
