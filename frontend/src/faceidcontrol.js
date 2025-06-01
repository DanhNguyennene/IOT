import React, { useState, useEffect } from 'react';
import apiClient from './api';
import './faceidcontrol.css';
const FaceIDSettings = () => {
  const [isFaceIDEnabled, setIsFaceIDEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Fetch FaceID status
  useEffect(() => {
    const fetchFaceIDStatus = async () => {
      try {
        const response = await apiClient.get('/faceid/status');
        setIsFaceIDEnabled(response.data.enabled);
      } catch (error) {
        if (error.response?.status === 403) {
          setError("Session expired. Please log in again.");
        } else {
          setError("Failed to fetch FaceID status.");
        }
      }
    };

    fetchFaceIDStatus();
  }, []);

  // Enable FaceID (start camera for login)
  const handleEnableFaceID = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/faceid/login');
      setIsFaceIDEnabled(true);
    } catch (err) {
      setError('Failed to enable FaceID');
    } finally {
      setIsLoading(false);
    }
  };

  // Disable FaceID
  const handleDisableFaceID = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/faceid/disable');
      setIsFaceIDEnabled(false);
    } catch (err) {
      setError('Failed to disable FaceID');
    } finally {
      setIsLoading(false);
    }
  };

  // Enroll FaceID (show password modal)
  const handleEnrollFaceID = () => {
    setShowPasswordModal(true);
  };

  // Submit password for FaceID enrollment
  const handleSubmitPassword = async () => {
    if (!passwordInput.trim()) {
      setPasswordError('Password is required');
      return;
    }

    setIsLoading(true);
    setPasswordError('');
    try {
      await apiClient.post('/faceid/signupface', { password: passwordInput });
      setIsFaceIDEnabled(true);
      setShowPasswordModal(false);
      setPasswordInput('');
    } catch (err) {
      if (err.response?.status === 401) {
        setPasswordError('Invalid password');
      } else {
        setError('Failed to enroll FaceID');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="setting-section">
      <h2>FaceID Settings</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="faceid-toggle">
        <label>
          <input
            type="checkbox"
            checked={isFaceIDEnabled}
            onChange={() => {
              if (isFaceIDEnabled) {
                handleDisableFaceID();
              } else {
                handleEnableFaceID();
              }
            }}
            disabled={isLoading}
          />
          {isFaceIDEnabled ? 'Enabled' : 'Disabled'}
        </label>
      </div>

      {!isFaceIDEnabled && (
        <button 
          className="enroll-button" 
          onClick={handleEnrollFaceID} 
          disabled={isLoading}
        >
          Enroll FaceID
        </button>
      )}

      {isFaceIDEnabled && (
        <p className="status-message">FaceID is currently enabled for authentication.</p>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <h3>Confirm Password</h3>
            <p>Re-enter your password to enroll FaceID.</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password"
            />
            {passwordError && <p className="error-message">{passwordError}</p>}
            <div className="modal-buttons">
              <button onClick={handleSubmitPassword} disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Submit'}
              </button>
              <button onClick={() => setShowPasswordModal(false)} disabled={isLoading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FaceIDSettings;