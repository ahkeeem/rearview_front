import { useEffect, useRef } from 'react';

const useInactivityTimeout = (onTimeout, timeoutMs = 30 * 60 * 1000) => {
    const timerRef = useRef(null);

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onTimeout();
        }, timeoutMs);
    };

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        const handleActivity = () => resetTimer();

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Initialize timer
        resetTimer();

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [onTimeout, timeoutMs]);

    return resetTimer;
};

export default useInactivityTimeout;
