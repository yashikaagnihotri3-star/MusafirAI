import { Link, useNavigate } from "react-router-dom";

import mountainBg from "../assets/mountain-bg.png";

function Login() {

  const navigate = useNavigate();


  const handleLogin = (e) => {

    e.preventDefault();

    navigate("/Dashboard");

  };


  return (

    <div className="auth-page">

      <div
        className="auth-background"
        style={{
          backgroundImage: `url(${mountainBg})`
        }}
      ></div>


      <div className="auth-overlay"></div>


      <Link
        to="/"
        className="auth-logo"
      >
        ✦ Musafir<span>AI</span>
      </Link>


      <div className="auth-card">


        <div className="auth-header">

          <div className="auth-icon">
            ✦
          </div>

          <h1>
            Welcome Back!
          </h1>

          <p>
            Plan your next journey with MusafirAI
          </p>

        </div>


        <form onSubmit={handleLogin}>


          <div className="input-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              required
            />

          </div>


          <div className="input-group">

            <div className="password-label">

              <label>
                Password
              </label>

              

            </div>


            <input
              type="password"
              placeholder="Enter your password"
              required
            />

          </div>


          <button
            type="submit"
            className="auth-button"
          >
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