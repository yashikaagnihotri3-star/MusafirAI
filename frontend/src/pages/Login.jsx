import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import mountainBg from "../assets/mountain-bg.png";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const data = await apiRequest("/api/accounts/login/", {
        method: "POST",
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user_id", data.user_id);

      navigate("/Dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-page">
      <div
        className="auth-background"
        style={{
          backgroundImage: `url(${mountainBg})`,
        }}
      ></div>

      <div className="auth-overlay"></div>

      <Link to="/" className="auth-logo">
        ✦ Musafir<span>AI</span>
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">✦</div>

          <h1>Welcome Back!</h1>

          <p>Plan your next journey with MusafirAI</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <div className="password-label">
              <label>Password</label>
            </div>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                required
              />

              <button
                type="button"
                className="password-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <p className="switch-auth">
          Don't have an account?

          <Link to="/signup">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

