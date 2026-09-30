const API_URL = "http://127.0.0.1:8000";

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("access_token");

    const isLoginRequest = endpoint === "/api/accounts/login/";

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(!isLoginRequest && token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            ...(options.headers || {}),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || data.detail || data.message || "Something went wrong"
        );
    }

    return data;
}