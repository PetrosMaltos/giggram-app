import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, query, where, getDocs, updateDoc } from 'firebase/firestore'; // Добавьте updateDoc сюда
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateEmail } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBR-ViuYKvxtuCfPDZwq2DHsHby9B4NPC0",
  authDomain: "giggram-4aa20.firebaseapp.com",
  projectId: "giggram-4aa20",
  storageBucket: "giggram-4aa20.appspot.com",
  messagingSenderId: "299723601231",
  appId: "1:299723601231:web:039f135c8fc9ce541c813a",
  measurementId: "G-5865DYTVB9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage();

// Функция для получения данных пользователя
export const getUserData = async (uid) => {
  try {
    const userDoc = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDoc);
    if (userSnapshot.exists()) {
      return userSnapshot.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const getResponses = async () => {
  const userId = auth.currentUser?.uid;
  const responses = [];

  if (!userId) {
    throw new Error("User is not authenticated");
  }

  try {
    const q = query(collection(db, "orders"), where("responses", "!=", null));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      if (orderData.responses && orderData.responses.length > 0) {
        orderData.responses.forEach((response) => {
          if (response.userId === userId) {
            responses.push({
              projectName: orderData.projectName || 'Без названия',
              message: response.message || 'Сообщение отсутствует',
              date: response.date || new Date(),
            });
          }
        });
      }
    });
    
    return responses;
  } catch (error) {
    console.error("Error fetching responses:", error);
    throw error;
  }
};




// Функция для обновления данных пользователя
export const updateUserData = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, userData, { merge: true });
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};

// Функция для загрузки аватара
export const uploadAvatar = async (file, userId) => {
  const storageRef = ref(storage, `avatars/${userId}/${file.name}`);
  try {
    // Загрузка файла
    await uploadBytes(storageRef, file);
    
    // Получение URL файла
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

// Функция для обновления email пользователя
export const updateUserEmail = async (newEmail) => {
  const user = auth.currentUser;
  if (user) {
    try {
      await updateEmail(user, newEmail);
      console.log('Email updated successfully');
    } catch (error) {
      throw new Error('Не удалось обновить email: ' + error.message);
    }
  } else {
    throw new Error('Пользователь не аутентифицирован');
  }
};

// Функция для проверки, существует ли имя пользователя в базе данных
export const checkUsernameExists = async (username) => {
  try {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username existence:', error);
    return false;
  }
};

// Функция для проверки текущего пароля
export const verifyCurrentPassword = async (email, currentPassword) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, currentPassword);
    return !!userCredential.user;
  } catch (error) {
    console.error('Error verifying current password:', error);
    return false;
  }
};

// Примерная структура для заморозки средств
const handlePayment = async (amount, orderId, userId) => {
  try {
    // Вызов API для заморозки средств
    const paymentResult = await paymentService.freezeFunds(amount, orderId, userId);
    if (paymentResult.success) {
      await updateDoc(doc(db, 'orders', orderId), { paymentStatus: 'frozen' });
    }
  } catch (error) {
    console.error('Ошибка заморозки средств:', error);
  }
};


// Экспорт необходимых Firebase модулей
export { db, storage, collection, auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, onSnapshot, signInWithPopup, doc, getDoc, updateDoc };
