import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import homepageImg from './homepageimg.jpg';
import logoImg from './yolohome.png';

const HomePage = () => {
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
            to="/login"
            style={{
              padding: '10px 20px',
              backgroundColor: '#8b5a2b',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '16px',
              textDecoration: 'none', // Remove underline
              display: 'inline-block', // Ensure padding works correctly
            }}
          >
            LOGIN
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
        }}
      >
        {/* Text Section */}
        <div style={{ flex: 1, paddingRight: '20px' }}>
          <h1 style={{ fontSize: '48px', color: '#333', marginBottom: '20px' }}>
            smart<span style={{ fontWeight: 'normal' }}>home</span>
          </h1>
          <h2
            style={{
              fontSize: '36px',
              color: '#333',
              marginBottom: '20px',
              textTransform: 'uppercase',
            }}
          >
            Your home can do anything!
          </h2>
          <p style={{ fontSize: '24px', color: '#333', marginBottom: '30px' }}>
            Welcome to my smart home
          </p>
          <button
            style={{
              padding: '15px 30px',
              backgroundColor: '#8b5a2b',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            LEARN MORE
          </button>
        </div>

        {/* Image Section */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <img
            src={homepageImg}
            alt="Interior 1"
            style={{ width: '150px', height: '400px', objectFit: 'cover' }}
          />
          <img
            src={homepageImg}
            alt="Interior 2"
            style={{ width: '150px', height: '400px', objectFit: 'cover' }}
          />
          <img
            src={homepageImg}
            alt="Interior 3"
            style={{ width: '150px', height: '400px', objectFit: 'cover' }}
          />
        </div>
      </main>
    </div>
  );
};

export default HomePage;