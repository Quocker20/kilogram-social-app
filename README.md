# 📸 Kilogram - Social Media & AI Recommendation

## 📝 Overview
Kilogram là một mạng xã hội chia sẻ hình ảnh hiện đại, tích hợp hệ thống gợi ý nội dung thông minh. Dự án tập trung vào việc áp dụng kiến trúc Microservices lai và xử lý dữ liệu vector cho AI.

## 🏗️ Architecture
- **Backend Core**: Java 21, Spring Boot 4.0.3 (REST API, WebSockets).
- **AI Microservice**: Python, FastAPI, CLIP Model (Feature Extraction), FAISS (Vector Search).
- **Frontend**: ReactJS, TailwindCSS.
- **Database**: MySQL.

## 📁 Project Structure
- `/backend-core`: Chứa mã nguồn Spring Boot chính.
- `/backend-ai`: Chứa phân hệ trí tuệ nhân tạo (Python).
- `/frontend-web`: Chứa mã nguồn giao diện React.
- `/docker`: Chứa các file cấu hình Docker Deployment.

## 🚀 Key Features
- **Social**: Post, Like, Comment, Follow.
- **AI Explore**: Đề xuất ảnh dựa trên lịch sử tương tác của người dùng.
- **Real-time Chat**: Nhắn tin 1-1 qua WebSockets.
- **Carousel Posts**: Hỗ trợ đăng nhiều ảnh trong một bài viết.