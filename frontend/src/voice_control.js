import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './sidebar';
import './voice_control.css';

const VoiceControlPage = () => {
  const [recordingState, setRecordingState] = useState(0);
  const [text, setText] = useState('');
  const [prediction, setPrediction] = useState('');
  const [error, setError] = useState('');

  // Effect to handle state-based text and prediction updates
  useEffect(() => {
    if (recordingState === 1) {
      setText('Recording...');
      setPrediction('Recording...');
    } else if (recordingState === -1) {
      setText('Processing...');
      setPrediction('Processing...');
    }
  }, [recordingState]);

  // Function to read the latest command from commands.json
  const readLatestCommand = async () => {
    try {
      const response = await fetch('/audio/commands.json');
      if (!response.ok) {
        throw new Error('Failed to fetch commands.json');
      }
      const commands = await response.json();
      if (commands && commands.length > 0) {
        const latestCommand = commands[commands.length - 1];
        console.log('Latest command:', latestCommand.transcribed_text);
        console.log('Latest command text:', latestCommand.label);
        console.log('Current recording state:', recordingState);

        // Only update if we're in ready state (0)
        if (recordingState === 0) {
          setText(latestCommand.transcribed_text);
          setPrediction(latestCommand.chatbot_response);
        }
      }
    } catch (error) {
      console.error('Error reading commands.json:', error);
    }
  };

  // Poll for latest command every 2 seconds
  useEffect(() => {
    const interval = setInterval(readLatestCommand, 2000);
    return () => clearInterval(interval);
  }, [recordingState]); // Add recordingState as dependency

  // Log state changes
  useEffect(() => {
    console.log('Current recording state:', recordingState);
  }, [recordingState]);

  const handleToggleRecording = async () => {
    try {
      console.log('Current state before toggle:', recordingState);
      
      if (recordingState === -1) {
        console.log('Button is disabled, ignoring click');
        return;
      }
      
      // If we're not recording, start recording
      if (recordingState === 0) {
        console.log('Starting recording...');
        setRecordingState(1); // Set to recording state immediately
        const response = await axios.post('http://127.0.0.1:5000/api/toggle_recording');
        console.log('Start recording response:', response.data);
      } 
      // If we're recording, stop recording
      else if (recordingState === 1) {
        console.log('Stopping recording...');
        setRecordingState(-1); // Set to processing state immediately
        const response = await axios.post('http://127.0.0.1:5000/api/toggle_recording');
        console.log('Stop recording response:', response.data);
        
        if (response.data.audio_file) {
          // Recording was stopped, process the audio
          console.log('Processing audio file...');
          setText('Processing...');
          setPrediction('Processing...');

          try {
            const { audio_file, date_str, duration } = response.data;
            console.log('Sending transcription request...');
            
            const transcribeResponse = await axios.post('http://127.0.0.1:5000/api/transcribing', {
              audio_file,
              date_str,
              duration
            });

            console.log('Transcription response:', transcribeResponse.data);
            
            // Update text and prediction in a single batch
            setText(transcribeResponse.data.transcribed_text);
            setPrediction(transcribeResponse.data.chatbot_response);
            
            console.log('Setting new text:', transcribeResponse.data.transcribed_text);
            console.log('Setting new prediction:', transcribeResponse.data.chatbot_response);
          } catch (error) {
            console.error('Error during transcription:', error);
            setError('Error occurred during processing');
            setText('');
            setPrediction('');
          } finally {
            // Add a small delay before resetting state to ensure UI updates
            setTimeout(() => {
              console.log('Resetting state to ready (0)');
              setRecordingState(0);
            }, 100);
          }
        }
      }
    } catch (error) {
      console.error('Error during recording:', error);
      setError('Error occurred during recording');
      setText('');
      setPrediction('');
      setRecordingState(0);
    }
  };

  // Reset text and prediction when starting new recording
  useEffect(() => {
    if (recordingState === 1) {
      console.log('Starting new recording, resetting text and prediction');
      setText('');
      setPrediction('');
      setError('');
    }
  }, [recordingState]);

  // Debug state changes
  useEffect(() => {
    const states = ['Ready', 'Recording', 'Processing'];
    console.log(`State changed to: ${states[recordingState + 1]}`);
  }, [recordingState]);

  return (
    <div className="voice-control-page">
      {/* Sidebar */}
      <Sidebar activePage="VOICE CONTROL" />

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="header-title">Voice Control</h1>
            <p className="header-subtitle">Hi Thao, what do you want?</p>
          </div>
        </header>

        <div className="content-container">
          <div className="recording-container">
            <button
              className={`record-button ${
                recordingState === 1 ? 'recording' : 
                recordingState === -1 ? 'processing' : ''
              }`}
              onClick={handleToggleRecording}
              disabled={recordingState === -1}
            >
              <i className={`mic-icon ${
                recordingState === 1 ? 'fas fa-microphone' : 
                recordingState === -1 ? 'fas fa-spinner' : 'fas fa-microphone'
              }`}></i>
            </button>
            <div className="recording-status">
              {recordingState === -1 ? 'Processing audio...' : 
               recordingState === 1 ? 'Recording...' : 'Click to start recording'}
            </div>
          </div>

          {error && (
            <div className="error-card">
              <p>{error}</p>
            </div>
          )}

          {/* Result Section */}
          <div className="result-container">
            <div className="result-card">
              <h3>Transcribed Text</h3>
              <p className="result-text">{text || 'Recording...'}</p>
            </div>
            <div className="result-card">
              <h3>Predicted Command</h3>
              <p className="result-prediction">{prediction || 'Recording...'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoiceControlPage;