import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export const useTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timerId); // Cleanup on unmount
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening'; // Or Good Evening, depending on preference
  };

  return {
    timeString: format(currentTime, 'HH:mm:ss'),
    dateString: format(currentTime, 'EEEE, MMMM d, yyyy'),
    greeting: getGreeting(),
  };
};