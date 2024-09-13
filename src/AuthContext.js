import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebaseConfig'; // Импортируйте настройки Firebase

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Убедитесь, что используется currentUser

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user); // Устанавливаем currentUser, когда пользователь аутентифицирован
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
