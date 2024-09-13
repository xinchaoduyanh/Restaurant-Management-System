import envConfig from "@/config"; // Import cấu hình môi trường (bao gồm URL API gốc)
import { normalizePath } from "@/lib/utils"; // Import hàm chuẩn hóa đường dẫn URL
import { LoginResType } from "@/schemaValidations/auth.schema"; // Kiểu dữ liệu cho kết quả trả về của API login
import { redirect } from "next/navigation"; // Import hàm redirect của Next.js để chuyển hướng trang

// Loại bỏ method khỏi RequestInit và thêm tùy chọn baseUrl tùy chọn
type CustomOptions = Omit<RequestInit, "method"> & {
  baseUrl?: string | undefined; // baseUrl có thể undefined hoặc string
};

// Định nghĩa các mã lỗi HTTP cụ thể
const ENTITY_ERROR_STATUS = 422; // Lỗi dữ liệu không hợp lệ (validation error)
const AUTHENTICATION_ERROR_STATUS = 401; // Lỗi xác thực (authentication error)

// Định nghĩa kiểu dữ liệu cho lỗi thực thể (entity errors)
type EntityErrorPayload = {
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
};

// Tạo class HttpError để biểu diễn lỗi HTTP
export class HttpError extends Error {
  status: number; // Mã lỗi HTTP
  payload: {
    message: string;
    [key: string]: any;
  };

  // Constructor nhận status, payload và message
  constructor({
    status,
    payload,
    message = "Lỗi HTTP",
  }: {
    status: number;
    payload: any;
    message?: string;
  }) {
    super(message); // Gọi constructor của lớp Error với thông báo lỗi
    this.status = status;
    this.payload = payload;
  }
}

// Tạo class EntityError kế thừa từ HttpError, dùng cho lỗi thực thể (Entity errors)
export class EntityError extends HttpError {
  status: typeof ENTITY_ERROR_STATUS; // Luôn là 422
  payload: EntityErrorPayload; // Payload chứa thông tin chi tiết về lỗi

  // Constructor nhận status và payload
  constructor({
    status,
    payload,
  }: {
    status: typeof ENTITY_ERROR_STATUS;
    payload: EntityErrorPayload;
  }) {
    super({ status, payload, message: "Lỗi thực thể" }); // Gọi constructor của HttpError với message mặc định là "Lỗi thực thể"
    this.status = status;
    this.payload = payload;
  }
}

// Biến global cho client logout request
let clientLogoutRequest: null | Promise<any> = null;
// Kiểm tra xem đang chạy trên client hay server
const isClient = typeof window !== "undefined";

// Hàm request để thực hiện các phương thức HTTP chính (GET, POST, PUT, DELETE)
const request = async <Response>(
  method: "GET" | "POST" | "PUT" | "DELETE", // Phương thức HTTP
  url: string, // URL của API
  options?: CustomOptions | undefined // Tùy chọn thêm cho request
) => {
  let body: FormData | string | undefined = undefined; // Khởi tạo body

  // Kiểm tra nếu body là FormData thì giữ nguyên, nếu không thì chuyển thành chuỗi JSON
  if (options?.body instanceof FormData) {
    body = options.body;
  } else if (options?.body) {
    body = JSON.stringify(options.body);
  }

  // Đặt headers cơ bản cho request
  const baseHeaders: { [key: string]: string } =
    body instanceof FormData
      ? {} // Nếu body là FormData thì không thêm Content-Type
      : {
          "Content-Type": "application/json", // Nếu không, thì dùng JSON
        };

  // Nếu đang ở client, lấy accessToken từ localStorage và thêm vào headers
  if (isClient) {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      baseHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  // Thiết lập baseUrl từ config hoặc từ options
  const baseUrl =
    options?.baseUrl === undefined
      ? envConfig.NEXT_PUBLIC_API_ENDPOINT // Nếu không truyền baseUrl thì lấy từ env
      : options.baseUrl;

  // Chuẩn hóa full URL
  const fullUrl = `${baseUrl}/${normalizePath(url)}`;

  // Thực hiện fetch request với phương thức, URL, headers và body
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers,
    } as any,
    body,
    method,
  });

  // Lấy payload từ kết quả trả về của API
  const payload: Response = await res.json();

  const data = {
    status: res.status, // Lưu trạng thái HTTP
    payload, // Lưu nội dung trả về
  };

  // Kiểm tra nếu kết quả trả về không thành công (res.ok === false)
  if (!res.ok) {
    // Nếu là lỗi thực thể (422)
    if (res.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(
        data as {
          status: 422;
          payload: EntityErrorPayload;
        }
      );
      // Nếu là lỗi xác thực (401)
    } else if (res.status === AUTHENTICATION_ERROR_STATUS) {
      if (isClient) {
        // Xử lý logout nếu có lỗi xác thực
        if (!clientLogoutRequest) {
          clientLogoutRequest = fetch("/api/auth/logout", {
            method: "POST",
            body: null, // Đảm bảo logout luôn thành công
            headers: {
              ...baseHeaders,
            } as any,
          });
          try {
            await clientLogoutRequest;
          } catch (error) {
          } finally {
            localStorage.removeItem("accessToken"); // Xóa accessToken khỏi localStorage
            localStorage.removeItem("refreshToken"); // Xóa refreshToken khỏi localStorage
            clientLogoutRequest = null;
            location.href = "/login"; // Chuyển hướng về trang login
          }
        }
      } else {
        // Nếu là server, thực hiện redirect với accessToken
        const accessToken = (options?.headers as any)?.Authorization.split(
          "Bearer "
        )[1];
        redirect(`/logout?accessToken=${accessToken}`);
      }
    } else {
      throw new HttpError(data); // Nếu là lỗi khác, ném ra HttpError
    }
  }

  // Xử lý logic chỉ chạy trên client (trình duyệt)
  if (isClient) {
    const normalizeUrl = normalizePath(url); // Chuẩn hóa URL
    if (normalizeUrl === "api/auth/login") {
      // Nếu là login, lưu lại accessToken và refreshToken
      const { accessToken, refreshToken } = (payload as LoginResType).data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    } else if (normalizeUrl === "api/auth/logout") {
      // Nếu là logout, xóa các token khỏi localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
  return data; // Trả về dữ liệu cho phía client
};

// Định nghĩa các phương thức HTTP của http (GET, POST, PUT, DELETE)
const http = {
  get<Response>(
    url: string, // URL của API
    options?: Omit<CustomOptions, "body"> | undefined // Tùy chọn không có body
  ) {
    return request<Response>("GET", url, options); // Thực hiện GET request
  },
  post<Response>(
    url: string, // URL của API
    body: any, // Body của request
    options?: Omit<CustomOptions, "body"> | undefined // Tùy chọn khác
  ) {
    return request<Response>("POST", url, { ...options, body }); // Thực hiện POST request
  },
  put<Response>(
    url: string, // URL của API
    body: any, // Body của request
    options?: Omit<CustomOptions, "body"> | undefined // Tùy chọn khác
  ) {
    return request<Response>("PUT", url, { ...options, body }); // Thực hiện PUT request
  },
  delete<Response>(
    url: string, // URL của API
    options?: Omit<CustomOptions, "body"> | undefined // Tùy chọn khác
  ) {
    return request<Response>("DELETE", url, { ...options }); // Thực hiện DELETE request
  },
};

// Export http object để sử dụng trong các phần khác của dự án
export default http;
