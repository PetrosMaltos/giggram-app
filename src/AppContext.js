import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [hasVisited, setHasVisited] = useState(false);

    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            const userData = window.Telegram.WebApp.initDataUnsafe.user;
            if (userData) {
                const hasVisited = window.Telegram.WebApp.storage.getItem('hasVisited') === 'true';
                setHasVisited(hasVisited);
            }
        }
    }, []);

    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.storage.setItem('hasVisited', hasVisited.toString());
        }
    }, [hasVisited]);

    return (
        <AppContext.Provider value={{ hasVisited, setHasVisited }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);