import { Link, useNavigate } from "react-router-dom";

import mountainBg from "../assets/mountain-bg.png";

function Signup() {

  const navigate = useNavigate();


  const handleSignup = (e) => {

    e.preventDefault();

    navigate("/");

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


      <div className="auth-card signup-card">


        <div className="auth-header">

          <div className="auth-icon">
            ✦
          </div>

          <h1>
            Create Your Account
          </h1>

          <p>
            Join MusafirAI and start exploring
          </p>

        </div>


        <form onSubmit={handleSignup}>


          <div className="input-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              required
            />

          </div>


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

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              required
            />

          </div>


          <div className="input-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              required
            />

          </div>


          <button
            type="submit"
            className="auth-button"
          >
            Create Account
          </button>


        </form>


        <div className="divider">
          <span>OR</span>
        </div>




        <p className="switch-auth">

          Already have an account?

          <Link to="/login">
            Login
          </Link>

        </p>


      </div>

    </div>

  );
}

export default Signup;