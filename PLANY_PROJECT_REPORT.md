# 🎓 Planny: The Cognitive Architect - Báo Cáo Tổng Kết Dự Án

**Planny** là một ứng dụng lập kế hoạch học tập thông minh, được thiết kế để giúp người dùng tối ưu hóa thời gian, chia nhỏ mục tiêu và duy trì sự tập trung cao độ thông qua phương pháp học tập khoa học.

---

## 🚀 1. Hệ Sinh Thái Công Nghệ (Tech Stack)

Chúng ta đã sử dụng những công nghệ hiện đại nhất để đảm bảo ứng dụng chạy nhanh, mượt và bảo mật:

### **Frontend & Framework**
- **Next.js 15 (App Router)**: Framework mạnh mẽ nhất hiện nay cho React, hỗ trợ Server Components giúp tăng tốc độ tải trang cực nhanh.
- **Tailwind CSS**: Dùng để xây dựng giao diện (UI) theo phong cách hiện đại, hỗ trợ Dark Mode và đáp ứng tốt trên mọi kích thước màn hình (Responsive).
- **TypeScript**: Giúp code luôn chuẩn xác, giảm thiểu lỗi trong quá trình phát triển.

### **Backend & Database**
- **Prisma**: Một ORM (Object-Relational Mapping) giúp giao tiếp với Database bằng ngôn ngữ lập trình thay vì viết SQL phức tạp.
- **PostgreSQL (Supabase)**: Hệ quản trị cơ sở dữ liệu mạnh mẽ, đáng tin cậy nhất hiện nay, được lưu trữ trên điện toán đám mây (Cloud).
- **NextAuth.js (Auth.js)**: Hệ thống quản lý đăng nhập đa nền tảng (Email, Google, Facebook).

### **Trí Tuệ Nhân Tạo & Tiện Ích**
- **Google Generative AI (Gemini)**: "Bộ não" của ứng dụng, hỗ trợ phân tích mục tiêu và đưa ra lời khuyên học tập.
- **Resend**: Dịch vụ gửi Email tự động chuyên nghiệp để xác thực tài khoản và khôi phục mật khẩu.

---

## 🛠️ 2. Các Tính Năng Cốt Lõi

### **A. Bảng Điều Khiển Thông Minh (Interactive Dashboard)**
- Tổng hợp chỉ số năng suất theo ngày/tuần.
- Theo dõi Streak (số ngày học liên tục) để tạo động lực.
- Hiển thị lịch trình tập trung ngay trong tầm mắt.

### **B. Quản Lý Nhiệm Vụ (Task Management)**
- Giao diện kéo thả, chia nhỏ nhiệm vụ theo môn học và mức độ ưu tiên.
- Hỗ trợ thiết lập thời gian bắt đầu và kết thúc linh hoạt.

### **C. Lịch Học Tập (Smart Calendar)**
- Chế độ xem theo tháng và ngày linh hoạt.
- Tự động đồng bộ hóa nhiệm vụ (Task) và sự kiện (Event).

### **D. Đồng Hồ Pomodoro & Study Session**
- Đồng hồ đếm ngược giúp duy trì sự tập trung 25/5 hoặc tùy chỉnh.
- Ghi lại nhật ký thời gian học để phân tích năng suất sau này.

---

## 🧱 3. Hệ Thống Bảo Mật & Hạ Tầng

- **HTTPS & Secure Cookies**: Đảm bảo thông tin người dùng luôn được mã hóa khi truyền tải qua mạng.
- **Password Hashing (Bcrypt)**: Mật khẩu của bạn được băm (hash) nhiều lớp trước khi lưu vào Database, ngay cả quản trị viên cũng không thể biết mật khẩu thật.
- **Cloud Hosting (Vercel)**: Triển khai trên hạ tầng của Vercel, giúp trang web luôn online 24/7 và có tốc độ truy cập toàn cầu.

---

## 📉 4. Những Cải Tiến Quan Trọng Vừa Thực Hiện

1. **Chuyển đổi Database**: Từ SQLite (chỉ dùng trên máy cá nhân) sang **PostgreSQL (Supabase)** để ứng dụng có thể dùng được trên môi trường web toàn cầu.
2. **Hardening Auth**: Gia cố hệ thống đăng nhập, sửa lỗi điều hướng và xử lý các trường hợp phản hồi từ Server (500 Error).
3. **Manual Verification**: Hỗ trợ xác thực người dùng trực tiếp từ Database để vượt qua rào cản Sandbox của dịch vụ Email.
4. **Fix UI Dashboard**: Đồng bộ hóa màu sắc môn học và sửa lỗi hiển thị Task trên lịch.

---

## 🔮 5. Hướng Phát Triển Tương Lai

- **Mobile App**: Đóng gói thành ứng dụng để cài đặt trên điện thoại (PWA).
- **Gamification**: Thêm hệ thống đổi quà, huy chương để việc học thú vị hơn.
- **AI Coach**: Gemini có thể tự động sắp xếp lịch học dựa trên mức độ khó của môn học.

---

> [!TIP]
> **Planny** hiện đã ở trạng thái **Production-Ready**. Bạn có thể chia sẻ link cho bạn bè hoặc bắt đầu hành trình chinh phục kiến thức của chính mình ngay hôm nay!

**Báo cáo được chuẩn bị bởi Antigravity AI.** 🏛️🚀
