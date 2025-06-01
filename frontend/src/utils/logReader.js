import axios from 'axios';

let commands = [];
let processedFiles = new Set();

// Function to fetch all commands
const fetchAllCommands = async () => {
    try {
        const response = await axios.get('/audio/commands.json');
        commands = response.data;
        processedFiles = new Set(commands.map(cmd => cmd.audio_file));
        return commands;
    } catch (error) {
        console.error('Error in fetchAllCommands:', error);
        return [];
    }
};

// Function to check for new files
const checkForNewFiles = async () => {
    try {
        const response = await axios.get('/audio/commands.json');
        const newCommands = response.data;
        const newFiles = new Set(newCommands.map(cmd => cmd.audio_file));
        
        // Find commands with new files
        const commandsToAdd = newCommands.filter(cmd => !processedFiles.has(cmd.audio_file));
        
        // Update processed files
        commandsToAdd.forEach(cmd => processedFiles.add(cmd.audio_file));
        
        return commandsToAdd;
    } catch (error) {
        console.error('Error checking for new files:', error);
        return [];
    }
};

export const readCommandLogs = async () => {
    try {
        return await fetchAllCommands();
    } catch (error) {
        console.error('Error reading command logs:', error);
        throw error;
    }
};

let pollingInterval = null;

export const startPollingForNewFiles = (callback, interval = 5000) => {
    // Clear any existing interval
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    
    const poll = async () => {
        try {
            const newCommands = await checkForNewFiles();
            if (newCommands.length > 0) {
                callback(newCommands);
            }
        } catch (error) {
            console.error('Error polling for new files:', error);
        }
    };

    // Initial poll
    poll();
    
    // Set up interval
    pollingInterval = setInterval(poll, interval);
    
    // Return cleanup function
    return () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
    };
}; 