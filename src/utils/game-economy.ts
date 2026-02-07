// src/utils/game-economy.ts

export type Reward = {
    id: string;
    name: string;
    code: string;
    type: 'VOUCHER' | 'WISH' | 'GIFT';
    value: number; // Giá trị hiển thị
};

// CẤU HÌNH TỈ LỆ RA ĐỒ (Tổng trọng số không cần bằng 100, code tự tính)
const LOOT_TABLE = [
    { id: 'loi_chuc_1', weight: 600, type: 'WISH', name: 'Lời Chúc: Năm nay tình duyên phơi phới!', code: '', value: 0 },
    { id: 'loi_chuc_2', weight: 600, type: 'WISH', name: 'Lời Chúc: Tiền vào như nước, nhớ mua Mẹt Tre!', code: '', value: 0 },
    { id: 'giam_5k', weight: 150, type: 'VOUCHER', name: 'Voucher 5K (Đơn >50k)', code: 'LOCMON5K', value: 5000 },
    { id: 'freeship', weight: 50, type: 'VOUCHER', name: 'Mã Freeship (Đơn >200k)', code: 'FREESHIPTET', value: 30000 },
    { id: 'qua_tang', weight: 10, type: 'GIFT', name: 'Tặng 1 Dây Treo Đồng Xu', code: 'QUALOC', value: 10000 }, // Hiếm
];

export const getRandomReward = (): Reward => {
    const totalWeight = LOOT_TABLE.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of LOOT_TABLE) {
        if (random < item.weight) return item as Reward;
        random -= item.weight;
    }
    return LOOT_TABLE[0] as Reward;
};
