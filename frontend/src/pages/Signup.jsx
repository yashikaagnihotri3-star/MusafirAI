
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import mountainBg from "../assets/mountain-bg.png";

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");

    // Check passwords
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/accounts/signup/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle Django validation errors
        if (data.username) {
          setError(data.username[0]);
        } else if (data.email) {
          setError(data.email[0]);
        } else if (data.phone) {
          setError(data.phone[0]);
        } else if (data.password) {
          setError(data.password[0]);
        } else {
          setError("Signup failed. Please check your details.");
        }

        return;
      }

      // Signup successful
      alert("Account created successfully!");

      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      setError(
        "Unable to connect to the server. Please make sure Django is running."
      );
    } finally {
      setLoading(false);
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

      <div className="auth-card signup-card">
        <div className="auth-header">
          <div className="auth-icon">✦</div>

          <h1>Create Your Account</h1>

          <p>Join MusafirAI and start exploring</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>Full Name</label>

            <input
              type="text"
              name="username"
              placeholder="Enter your full name"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Phone Number</label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
  <label>Password</label>

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
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
</div>

          <div className="input-group">
  <label>Confirm Password</label>

  <div className="password-input-wrapper">
    <input
      type={showConfirmPassword ? "text" : "password"}
      name="confirmPassword"
      placeholder="Confirm your password"
      required
    />

    <button
      type="button"
      className="password-eye"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      aria-label={
        showConfirmPassword ? "Hide password" : "Show password"
      }
    >
      {showConfirmPassword ? (
        <EyeOff size={20} />
      ) : (
        <Eye size={20} />
      )}
    </button>
  </div>
</div>

          {error && (
            <p
              style={{
                color: "#e74c3c",
                marginBottom: "12px",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <p className="switch-auth">
          Already have an account?

          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
