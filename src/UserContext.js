import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        const ordersRef = collection(db, 'orders');
        const ordersSnapshot = await getDocs(query(ordersRef, where('userId', '==', user.uid)));
        setUserOrders(ordersSnapshot.docs.map(doc => doc.data()));
      }
    };
    fetchOrders();
  }, [user]);

  const fetchUserData = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setUser(userSnap.data());
    } else {
      setUser(null);
    }
  };

  const updateUser = async (newData) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { ...user, ...newData }, { merge: true });
      await fetchUserData(user.uid); // Обновляем данные после изменения
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, userOrders, updateUser, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};
