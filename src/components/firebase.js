import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyC1ABpOmoZXa20qMlID88QSyA1FOr4dV6c",
    authDomain: "samarthmeet-ee38d.firebaseapp.com",
    projectId: "samarthmeet-ee38d",
    storageBucket: "samarthmeet-ee38d.firebasestorage.app",
    messagingSenderId: "981549354650",
    appId: "1:981549354650:web:9a1db207116ceff2d2d923",
    measurementId: "G-XWGXQHCLN1"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFCMToken = async (userId) => {
  try {
    const token = await getToken(messaging, { vapidKey: "YOUR_VAPID_KEY" });
    if (token) {
      // Send token to backend
      await fetch("/api/users/fcm-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      });
    }
  } catch (error) {
    console.error("FCM token error:", error);
  }
};
