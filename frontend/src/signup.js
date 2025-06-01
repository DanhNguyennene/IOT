import React, { useState } from 'react';
import apiClient from './api';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    try {
      const response = await apiClient.post('/auth/signup', {
        name,
        email,
        password
      });


      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>CREATE ACCOUNT</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <input
          type="name"
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            padding: '15px',
            border: 'none',
            borderRadius: '10px',
            backgroundColor: '#f5e5b3',
            color: '#999',
          }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '15px',
            border: 'none',
            borderRadius: '10px',
            backgroundColor: '#f5e5b3',
            color: '#999',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: '15px',
            border: 'none',
            borderRadius: '10px',
            backgroundColor: '#f5e5b3',
            color: '#999',
          }}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{
            padding: '15px',
            border: 'none',
            borderRadius: '10px',
            backgroundColor: '#f5e5b3',
            color: '#999',
          }}
        />
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
          }}
        >
          SIGN UP
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ textDecoration: 'none', color: '#8b5a2b', fontWeight: 'bold' }}>
          Log In
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;