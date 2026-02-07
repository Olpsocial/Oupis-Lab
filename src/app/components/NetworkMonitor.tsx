'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Wifi, WifiOff } from 'lucide-react';

export default function NetworkMonitor() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Chỉ chạy ở phía client
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            toast.success('Đã khôi phục kết nối Internet', {
                icon: <Wifi className="w-4 h-4" />,
                duration: 3000,
            });
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast.error('Mất kết nối Internet. Vui lòng kiểm tra lại mạng!', {
                icon: <WifiOff className="w-4 h-4" />,
                duration: 10000, // Hiện lâu hơn để người dùng biết
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-500 text-white text-[10px] py-0.5 text-center flex items-center justify-center gap-2 animate-pulse overflow-hidden">
            <WifiOff className="w-3 h-3" />
            <span>Đang chạy ở chế độ ngoại tuyến (Offline)</span>
        </div>
    );
}
