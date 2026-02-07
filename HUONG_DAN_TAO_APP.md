# HƯỚNG DẪN TẠO APP ANDROID (APK) CHO NHÀ KIM HƯƠNG

Dự án của bạn đã được tích hợp **Capacitor**. Dưới đây là các bước để tạo file cài đặt .apk.

## Bước 1: Chuẩn bị môi trường
Đảm bảo máy tính của bạn đã cài đặt:
1. **Android Studio**: Tải tại [developer.android.com](https://developer.android.com/studio).
2. Trong Android Studio, vào **SDK Manager** và cài đặt **Android SDK** (thường nó sẽ tự cài khi khởi động lần đầu).

## Bước 2: Cấu hình App
Mở file `capacitor.config.ts` trong dự án này.

### Cách A: App trỏ về Website Online (Khuyên dùng)
- App sẽ giống như một trình duyệt riêng biệt hiển thị trang web của bạn.
- Cập nhật web là App tự cập nhật.
1. Tìm dòng `// url: 'https://APP_CUA_BAN.com',`
2. Bỏ dấu `//` ở đầu.
3. Thay đường dẫn bằng địa chỉ website thực tế của bạn (ví dụ: `https://nha-kim-huong.vercel.app`).
4. Lưu file.

### Cách B: App chạy Offline (Chỉ dùng cho Web tĩnh)
- Nếu dùng cách này, những tính năng cần Server (như gửi email, login, thanh toán) có thể bị lỗi.
1. Chạy lệnh: `npm run build`
2. Đảm bảo cấu hình Next.js là `output: 'export'`.

## Bước 3: Đồng bộ và Mở Android Studio
Mở Terminal (Ctrl + `) và chạy lệnh sau để đồng bộ cấu hình mới nhất sang thư mục Android:

```bash
npx cap sync
```

Sau đó, mở dự án trong Android Studio bằng lệnh:

```bash
npx cap open android
```
*(Hoặc bạn có thể mở Android Studio -> Open -> Chọn thư mục `android` trong folder dự án)*

## Bước 4: Tạo file APK
Trong giao diện Android Studio:
1. Đợi nó load xong (thanh loading bên dưới chạy xong).
2. Trên menu, chọn **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Khi chạy xong, một thông báo sẽ hiện lên góc dưới bên phải. Bấm **locate** để mở thư mục chứa file `.apk`.
4. Copy file đo gừi qua điện thoại để cài đặt và test!

## Lưu ý quan trọng
- **Icon App**: Để thay icon mặc định, bạn cần thay thế các ảnh trong thư mục `android/app/src/main/res/drawable...`. Hoặc dùng công cụ `capacitor-assets` để tự động tạo.
- **Quyền truy cập**: Nếu App cần Camera hay Vị trí, cần khai báo thêm trong `AndroidManifest.xml`.
