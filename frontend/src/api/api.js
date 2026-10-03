const API_URL = "http://127.0.0.1:8000";

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("access_token");

    const isLoginRequest = endpoint === "/api/accounts/login/";

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (!isLoginRequest && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401 && !isLoginRequest) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_id");

            window.location.href = "/login";

            throw new Error("Session expired. Please login again.");
        }

        throw new Error(
            data.error ||
            data.detail ||
            data.message ||
            "Something went wrong"
        );
    }

    return data;
}