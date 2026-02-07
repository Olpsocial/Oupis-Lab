import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nhakimhuong.app',
  appName: 'Nha Kim Huong',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // ---------------------------------------------------------------------------
    // BƯỚC QUAN TRỌNG NHẤT:
    // Hãy thay địa chỉ bên dưới bằng Link Website Vercel của bạn.
    // Ví dụ: url: 'https://nha-kim-huong.vercel.app',
    // ---------------------------------------------------------------------------
    url: 'https://nha-kim-huong.vercel.app',

    // Config này giúp tránh lỗi CORS và Cookie khi chạy trên App
    cleartext: true
  }
};

export default config;
