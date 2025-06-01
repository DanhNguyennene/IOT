import React, { useState, useEffect } from 'react';
import { startPollingForNewFiles } from '../utils/logReader';
import axios from 'axios';

const Commands = () => {
    const [commands, setCommands] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchCommands = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/v1/commands');
                if (isMounted) {
                    setCommands(response.data);
                    setIsLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    setError('Failed to fetch commands');
                    setIsLoading(false);
                }
            }
        };

        fetchCommands();

        // Start polling for new files
        const handleNewFiles = (newFiles) => {
            if (isMounted) {
                console.log('New files detected:', newFiles);
                setCommands(prevCommands => [...newFiles, ...prevCommands]);
            }
        };

        startPollingForNewFiles(handleNewFiles);

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Commands</h2>
            <ul>
                {commands.map((command, index) => (
                    <li key={index}>
                        <div>Time: {command.time_recorded}</div>
                        <div>Text: {command.transcribed_text}</div>
                        <div>Label: {command.label}</div>
                        <div>Duration: {command.duration_seconds}s</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Commands; 