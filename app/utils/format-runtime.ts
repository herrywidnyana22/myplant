// Function to format runtime (in ms) to "HH:MM:SS"
export const formatRuntime = (runtime: number): string => {
    const totalSeconds = Math.floor(runtime / 1000); // Convert ms to seconds
    const hours = Math.floor(totalSeconds / 3600); // 1 hour = 3600 seconds
    const minutes = Math.floor((totalSeconds % 3600) / 60); // Remaining minutes
    const seconds = totalSeconds % 60; // Remaining seconds

    // Format as "HH:MM:SS" with leading zeros
    const formattedTime = 
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0');
    
    return formattedTime;
};