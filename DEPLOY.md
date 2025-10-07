# Hướng Dẫn Tải và Triển Khai Dự Án

Tài liệu này sẽ hướng dẫn bạn cách tải mã nguồn của dự án này về máy tính cá nhân và triển khai nó lên nền tảng Vercel.

## I. Tải Dự Án Về Máy

Bạn có thể tải toàn bộ mã nguồn của dự án dưới dạng một tệp `.zip` trực tiếp từ giao diện của Firebase Studio.

1.  Tìm nút **"Download code"** (hoặc biểu tượng tương tự) trên thanh công cụ của trình chỉnh sửa.
2.  Nhấp vào đó, dự án sẽ được nén lại và tải về máy của bạn.
3.  Sau khi tải xong, hãy giải nén tệp `.zip` vào một thư mục trên máy tính của bạn.

Bây giờ bạn đã có toàn bộ mã nguồn và có thể mở nó bằng các trình chỉnh sửa code như Visual Studio Code, WebStorm...

## II. Triển Khai Lên Vercel

Vercel là một nền tảng tuyệt vời để triển khai các ứng dụng Next.js.

### Điều kiện tiên quyết:

*   Bạn đã có tài khoản [Vercel](https://vercel.com/signup).
*   Bạn đã có tài khoản trên một nhà cung cấp Git như [GitHub](https://github.com/), [GitLab](https://gitlab.com/), hoặc [Bitbucket](https://bitbucket.org/).

### Các bước thực hiện:

1.  **Đưa mã nguồn lên Git:**
    *   Tạo một repository (kho chứa) mới trên GitHub (hoặc nhà cung cấp Git bạn chọn).
    *   Mở terminal hoặc command prompt trong thư mục dự án đã giải nén ở bước trên.
    *   Thực hiện các lệnh sau để đưa mã nguồn lên repository vừa tạo:
        ```bash
        git init -b main
        git add .
        git commit -m "Initial commit"
        git remote add origin <URL_CUA_REPOSITORY_GIT>
        git push -u origin main
        ```
        *Lưu ý: Thay thế `<URL_CUA_REPOSITORY_GIT>` bằng URL của repository bạn đã tạo.*

2.  **Import dự án vào Vercel:**
    *   Đăng nhập vào tài khoản Vercel của bạn.
    *   Trên trang tổng quan, nhấp vào **"Add New..."** và chọn **"Project"**.
    *   Tìm và chọn repository bạn vừa đẩy mã nguồn lên, sau đó nhấp **"Import"**.

3.  **Cấu hình dự án:**
    *   Vercel thường sẽ tự động nhận diện đây là một dự án Next.js và cấu hình các thiết lập build một cách chính xác. Bạn có thể giữ nguyên các cài đặt mặc định.
    *   **Quan trọng:** Mở phần **"Environment Variables"** (Biến môi trường). Dự án này sử dụng Genkit và Google AI, vì vậy bạn cần cung cấp API Key của mình.
        *   **Tên (Name):** `GEMINI_API_KEY`
        *   **Giá trị (Value):** Dán API key của bạn vào đây.
        *   *Bạn có thể lấy API key miễn phí từ [Google AI Studio](https://aistudio.google.com/app/apikey).*

4.  **Triển khai:**
    *   Nhấp vào nút **"Deploy"**.
    *   Vercel sẽ bắt đầu quá trình build và triển khai ứng dụng của bạn. Quá trình này có thể mất vài phút.
    *   Sau khi hoàn tất, bạn sẽ nhận được một URL công khai cho ứng dụng của mình. Chúc mừng bạn đã triển khai thành công!
