import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from './yolohome.png';
import chair from './chair.png';
import { useAuth } from './AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState('email'); // Track login method
  const navigate = useNavigate();
  const { login, loginWithFaceID } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (loginMethod === 'email') {
      try {
        await login(email, password);
        navigate('/dashboard');
      } catch (err) {
        if (err.response?.status === 403) {
          setError("Invalid email or password.");
        } else {
          setError("Login failed. Please try again.");
        }
      }
    } else {
      // FaceID login (only email needed)
      try {
        await loginWithFaceID(email);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.detail || 'FaceID login failed. No face detected or mismatch.');
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #fff, #f5f0e1)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={logoImg}
            alt="Smart Home Logo"
            style={{ width: '50px', height: '50px', marginRight: '10px' }}
          />
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            SMART HOME
          </span>
        </div>

        {/* Navigation Links */}
        <nav>
          <Link
            to="/about"
            style={{
              marginRight: '20px',
              textDecoration: 'none',
              color: '#333',
              fontSize: '16px',
            }}
          >
            ABOUT US
          </Link>
          <Link
            to="/"
            style={{
              padding: '10px 20px',
              backgroundColor: '#8b5a2b',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '16px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            CANCEL
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main
        style={{
          display: 'flex',
          flex: 1,
          padding: '40px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Illustration Section */}
        <div style={{ flex: 1, paddingRight: '20px' }}>
          <img
            src={chair}
            alt="Illustration of chairs and table"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* Login Form Section */}
        <div style={{ flex: 1, maxWidth: '400px' }}>
          <h2
            style={{
              fontSize: '36px',
              color: '#333',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            LOGIN ACCOUNT
          </h2>
          {error && (
            <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Login Method Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => setLoginMethod('email')}
              style={{
                padding: '8px 16px',
                backgroundColor: loginMethod === 'email' ? '#8b5a2b' : '#f5e5b3',
                color: loginMethod === 'email' ? '#fff' : '#333',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Email & Password
            </button>
            <button
              onClick={() => setLoginMethod('faceid')}
              style={{
                padding: '8px 16px',
                backgroundColor: loginMethod === 'faceid' ? '#8b5a2b' : '#f5e5b3',
                color: loginMethod === 'faceid' ? '#fff' : '#333',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              FaceID
            </button>
          </div>

          {/* Form Fields */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}
          >
            <label
              style={{
                fontSize: '18px',
                color: '#333',
                marginBottom: '5px',
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: '15px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '10px',
                backgroundColor: '#f5e5b3',
                color: '#999',
              }}
            />

            {/* Show password field only for regular login */}
            {loginMethod === 'email' && (
              <>
                <label
                  style={{
                    fontSize: '18px',
                    color: '#333',
                    marginBottom: '5px',
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    padding: '15px',
                    fontSize: '16px',
                    border: 'none',
                    borderRadius: '10px',
                    backgroundColor: '#f5e5b3',
                    color: '#999',
                  }}
                />
              </>
            )}

            <button
              type="submit"
              style={{
                padding: '15px',
                backgroundColor: '#8b5a2b',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                marginTop: '20px',
              }}
            >
              {loginMethod === 'email' ? 'LOG IN' : 'Login with FaceID'}
            </button>
          </form>

          {/* Signup Prompt */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>
              Don't have an account?{' '}
              <Link
                to="/signup"
                style={{
                  textDecoration: 'none',
                  color: '#8b5a2b',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;