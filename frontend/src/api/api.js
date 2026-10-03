const API_URL = "http://127.0.0.1:8000";

export async function apiRequest(endpoint, options = {}) {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    const isLoginRequest = endpoint === "/api/accounts/login/";
    const isRefreshRequest = endpoint === "/api/accounts/token/refresh/";

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (!isLoginRequest && !isRefreshRequest && accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    let response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    let data = await response.json();

    // Access token expired/invalid
    if (
        response.status === 401 &&
        !isLoginRequest &&
        !isRefreshRequest &&
        refreshToken
    ) {
        const refreshResponse = await fetch(
            `${API_URL}/api/accounts/token/refresh/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refresh: refreshToken,
                }),
            }
        );

        const refreshData = await refreshResponse.json();

        if (refreshResponse.ok && refreshData.access) {

            // Save new access token
            localStorage.setItem(
                "access_token",
                refreshData.access
            );

            // Retry original request
            headers.Authorization =
                `Bearer ${refreshData.access}`;

            response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });

            data = await response.json();

        } else {

            // Refresh token also expired/invalid
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_id");

            throw new Error(
                "Your session has expired. Please login again."
            );
        }
    }

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