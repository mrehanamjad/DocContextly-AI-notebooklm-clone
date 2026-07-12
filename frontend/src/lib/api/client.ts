// import { APIResponse } from "./types";

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// export class APIError extends Error {
//   error_type: string;
//   details: any;
//   status: number;

//   constructor(message: string, error_type: string, details: any, status: number) {
//     super(message);
//     this.name = "APIError";
//     this.error_type = error_type;
//     this.details = details;
//     this.status = status;
//   }

// }

// /**
//  * Standard HTTP Request Wrapper using fetch
//  */
// async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
//   const url = `${BASE_URL}${path}`;

//   // Get token from localStorage (only in browser environment)
//   let token: string | null = null;
//   if (typeof window !== "undefined") {
//     token = localStorage.getItem("accessToken");
//   }

//   const headers = new Headers(options.headers || {});

//   if (token) {
//     headers.set("Authorization", `Bearer ${token}`);
//   }

//   // Set default content type if not uploading FormData
//   if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
//     headers.set("Content-Type", "application/json");
//   }

//   const response = await fetch(url, {
//     ...options,
//     headers,
//   });

//   // Handle No Content
//   if (response.status === 204) {
//     return {} as T;
//   }

//   let json: any;
//   try {
//     json = await response.json();
//   } catch (err) {
//     throw new APIError("Failed to parse server response", "PARSE_ERROR", null, response.status);
//   }

//   if (!response.ok || json.success === false) {
//     throw new APIError(
//       json.message || "An unexpected error occurred",
//       json.error_type || "INTERNAL_ERROR",
//       json.details || null,
//       response.status,
//     );
//   }

//   // Unpack standard response envelope
//   return (json as APIResponse<T>).data;
// }

// export const apiClient = {
//   get<T>(path: string, options?: RequestInit): Promise<T> {
//     return request<T>(path, { ...options, method: "GET" });
//   },

//   post<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
//     return request<T>(path, {
//       ...options,
//       method: "POST",
//       body: body instanceof FormData ? body : JSON.stringify(body),
//     });
//   },

//   put<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
//     return request<T>(path, {
//       ...options,
//       method: "PUT",
//       body: JSON.stringify(body),
//     });
//   },

//   patch<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
//     return request<T>(path, {
//       ...options,
//       method: "PATCH",
//       body: JSON.stringify(body),
//     });
//   },

//   delete<T>(path: string, options?: RequestInit): Promise<T> {
//     return request<T>(path, { ...options, method: "DELETE" });
//   },
// };
// export default apiClient;



import { APIResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class APIError extends Error {
  error_type: string;
  details: any;
  status: number;

  constructor(message: string, error_type: string, details: any, status: number) {
    super(message);
    this.name = "APIError";
    this.error_type = error_type;
    this.details = details;
    this.status = status;
  }
}

/**
 * Standard HTTP Request Wrapper using fetch
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Guard against a caller accidentally interpolating `undefined`/`null` into
  // the path (e.g. `/notebooks/${notebookId}/...` before notebookId resolves).
  // Without this, the request silently goes out as a literal "undefined"
  // segment and the backend returns a confusing 422 instead of a clear
  // client-side error pointing at the actual bug.
  if (/\/(undefined|null)(\/|$)/.test(path)) {
    throw new APIError(
      `Blocked request with an unresolved id in the URL: ${path}. ` +
        `A required id (e.g. notebookId) was undefined/null when this call was made.`,
      "CLIENT_INVALID_PATH",
      { path },
      0,
    );
  }

  const url = `${BASE_URL}${path}`;

  // Get token from localStorage (only in browser environment)
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken");
  }

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set default content type if not uploading FormData
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle No Content
  if (response.status === 204) {
    return {} as T;
  }

  let json: any;
  try {
    json = await response.json();
  } catch (err) {
    throw new APIError("Failed to parse server response", "PARSE_ERROR", null, response.status);
  }

  if (!response.ok || json.success === false) {
    throw new APIError(
      json.message || "An unexpected error occurred",
      json.error_type || "INTERNAL_ERROR",
      json.details || null,
      response.status,
    );
  }

  // Unpack standard response envelope
  return (json as APIResponse<T>).data;
}

export const apiClient = {
  get<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  patch<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
export default apiClient;