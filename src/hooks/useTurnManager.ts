'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const MAX_FREE_TURNS = 3;
const STORAGE_KEY = 'kimhuong_game_turns';
const LAST_RESET_KEY = 'kimhuong_last_reset';

export const useTurnManager = () => {
    const [turns, setTurns] = useState(0);
    const [mounted, setMounted] = useState(false);

    // 1. Khởi tạo: Kiểm tra xem sang ngày mới chưa để reset lượt
    useEffect(() => {
        setMounted(true);
        const lastReset = localStorage.getItem(LAST_RESET_KEY);
        const today = new Date().toDateString(); // Reset daily based on local date string

        if (lastReset !== today) {
            // Sang ngày mới -> Reset về 3 lượt
            setTurns(MAX_FREE_TURNS);
            localStorage.setItem(STORAGE_KEY, MAX_FREE_TURNS.toString());
            localStorage.setItem(LAST_RESET_KEY, today);
        } else {
            // Vẫn ngày cũ -> Lấy số lượt còn lại
            // Handle NaN case just in case
            const savedTurnsStr = localStorage.getItem(STORAGE_KEY);
            const savedTurns = savedTurnsStr ? parseInt(savedTurnsStr, 10) : MAX_FREE_TURNS;
            setTurns(isNaN(savedTurns) ? MAX_FREE_TURNS : savedTurns);
        }
    }, []);

    // 2. Hàm trừ lượt (Dùng khi bắt đầu chơi)
    const useTurn = (): boolean => {
        if (turns > 0) {
            const newTurns = turns - 1;
            setTurns(newTurns);
            localStorage.setItem(STORAGE_KEY, newTurns.toString());
            return true; // Cho phép chơi
        } else {
            return false; // Chặn lại
        }
    };

    // 3. Hàm cộng thêm lượt (Dùng khi làm nhiệm vụ)
    const addTurns = (amount: number) => {
        const newTurns = turns + amount;
        setTurns(newTurns);
        localStorage.setItem(STORAGE_KEY, newTurns.toString());
        toast.success(`Đã cộng thêm ${amount} lượt chơi!`);
    };

    return { turns, useTurn, addTurns, mounted };
};
