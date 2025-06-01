import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './sidebar'; // Import the Sidebar component
import { readCommandLogs, startPollingForNewFiles } from './utils/logReader';

// Import the CSS file
import './statistics.css';

const StatisticsPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [commandLogs, setCommandLogs] = useState([]);
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [error, setError] = useState(null);
  const [collapsedDates, setCollapsedDates] = useState(new Set());
  const [selectedLabel, setSelectedLabel] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const audioRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadCommands = async () => {
      try {
        const commands = await readCommandLogs();
        if (isMounted) {
          setCommandLogs(commands);
        }
      } catch (error) {
        console.error('Error loading commands:', error);
        if (isMounted) {
          setError('Failed to load command logs. Please check if the log files exist.');
          setCommandLogs([]);
        }
      }
    };

    // Load initial commands
    loadCommands();

    // Start polling for new files
    startPollingForNewFiles((newCommands) => {
      if (isMounted) {
        setCommandLogs(prevCommands => [...newCommands, ...prevCommands]);
      }
    });

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleDate = (date) => {
    setCollapsedDates(prev => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(date)) {
        newCollapsed.delete(date);
      } else {
        newCollapsed.add(date);
      }
      return newCollapsed;
    });
  };

  // Get unique labels from commands
  const uniqueLabels = ['all', ...new Set(commandLogs.map(command => command.label))];
  
  // Get unique dates from commands
  const uniqueDates = ['all', ...new Set(commandLogs.map(command => 
    new Date(command.time_recorded).toLocaleDateString()
  ))];

  // Filter commands based on selected label and date
  const filteredCommands = commandLogs.filter(command => {
    const commandDate = new Date(command.time_recorded).toLocaleDateString();
    const labelMatch = selectedLabel === 'all' || command.label === selectedLabel;
    const dateMatch = selectedDate === 'all' || commandDate === selectedDate;
    return labelMatch && dateMatch;
  });

  // Group filtered commands by date
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    const date = new Date(command.time_recorded).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(command);
    return acc;
  }, {});

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayCommand = (command) => {
    setSelectedCommand(command);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    try {
      // Extract just the filename from the path
      const audioFileName = command.audio_file.split('\\').pop();
      const audioUrl = `/audio/${audioFileName}`;
      console.log('Playing audio from:', audioUrl); // Debug log
      
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration);
        console.log('Audio duration:', audioRef.current.duration); // Debug log
      });

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current.currentTime);
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      });

      audioRef.current.addEventListener('error', (e) => {
        console.error('Error playing audio:', e);
        setError(`Failed to play audio file: ${e.message}`);
        setIsPlaying(false);
      });

      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        setError(`Failed to play audio file: ${error.message}`);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    } catch (error) {
      console.error('Error setting up audio:', error);
      setError(`Failed to set up audio playback: ${error.message}`);
      setIsPlaying(false);
    }
  };

  const handlePlayAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current) return;
    
    const progressBar = e.currentTarget;
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
    const progressBarWidth = progressBar.clientWidth;
    const clickPercentage = clickPosition / progressBarWidth;
    
    const newTime = clickPercentage * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(clickPercentage * 100);
    setCurrentTime(newTime);
  };

  return (
    <div className="statistics-page">
      <Sidebar activePage="STATISTICS" />
      <main className="statistics-main-content">
        <header className="statistics-header">
          <div>
            <h1 className="statistics-header-title">History of commands</h1>
            <p className="statistics-header-subtitle">Find what you have asked to do</p>
          </div>
          <div className="statistics-header-icon">
            <span className="material-icons">history</span>
          </div>
        </header>

        <div className="statistics-content-container">
          <div className="statistics-list-section">
            <div className="statistics-filters">
              <select 
                className="statistics-filter-select"
                value={selectedLabel}
                onChange={(e) => setSelectedLabel(e.target.value)}
              >
                {uniqueLabels.map(label => (
                  <option key={label} value={label}>
                    {label === 'all' ? 'All Labels' : label}
                  </option>
                ))}
              </select>
              <select 
                className="statistics-filter-select"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                {uniqueDates.map(date => (
                  <option key={date} value={date}>
                    {date === 'all' ? 'All Dates' : date}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="statistics-command-list-container">
              {error ? (
                <div className="statistics-error">{error}</div>
              ) : Object.keys(groupedCommands).length === 0 ? (
                <div className="statistics-empty">No commands found</div>
              ) : (
                Object.entries(groupedCommands).map(([date, commands]) => (
                  <div key={date} className="statistics-date-group">
                    <div 
                      className="statistics-date-title"
                      onClick={() => toggleDate(date)}
                    >
                      <span className={`statistics-date-toggle ${collapsedDates.has(date) ? 'collapsed' : ''}`}>
                        <span className="material-icons">expand_more</span>
                      </span>
                      <span className="statistics-date-text">{date}</span>
                    </div>
                    <div className={`statistics-date-commands ${collapsedDates.has(date) ? 'collapsed' : ''}`}>
                      {commands.map((command, index) => (
                        <div
                          key={index}
                          className={`statistics-command-item ${
                            index < commands.length - 1 ? 'statistics-border-bottom' : ''
                          }`}
                        >
                          <span className="statistics-command-time">
                            {new Date(command.time_recorded).toLocaleTimeString()}
                          </span>
                          <div className="statistics-command-info">
                            <span className="statistics-command-text">{command.transcribed_text}</span>
                            <span className="statistics-command-label">{command.label}</span>
                          </div>
                          <button 
                            className="statistics-command-play"
                            onClick={() => handlePlayCommand(command)}
                          >
                            <span className="material-icons">play_circle</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Audio Player */}
          <div className="statistics-audio-player">
            <div className="statistics-audio-icon">
              <span className="material-icons">graphic_eq</span>
            </div>

            <div className="statistics-audio-info">
              <p className="statistics-audio-text">
                {selectedCommand ? selectedCommand.transcribed_text : 'Select a command to play'}
              </p>
              {selectedCommand && (
                <div className="statistics-command-details">
                  <div className="statistics-detail-item">
                    <span className="material-icons">schedule</span>
                    <span>{new Date(selectedCommand.time_recorded).toLocaleTimeString()}</span>
                  </div>
                  <div className="statistics-detail-item">
                    <span className="material-icons">label</span>
                    <span>{selectedCommand.label}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="statistics-player-controls">
              <button 
                className={`statistics-play-button ${isPlaying ? 'playing' : ''}`}
                onClick={handlePlayAudio}
                disabled={!selectedCommand}
              >
                <span className="material-icons">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <div className="statistics-progress-bar-container">
                <span className="statistics-progress-time">{formatTime(currentTime)}</span>
                <div 
                  className="statistics-progress-bar"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="statistics-progress-filled" 
                    style={{ width: `${progress}%` }}
                  />
                  <div 
                    className="statistics-progress-handle" 
                    style={{ left: `${progress}%` }}
                  />
                </div>
                <span className="statistics-progress-time">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="statistics-audio-status">
              {isPlaying ? 'Playing...' : 'Paused'}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StatisticsPage;