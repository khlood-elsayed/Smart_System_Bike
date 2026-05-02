// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyChXdz-OGWYZQZBco2KaTzdVbbIeCrfoY0",
  authDomain: "smartbike-iot-e3e31.firebaseapp.com",
  projectId: "smartbike-iot-e3e31",
  storageBucket: "smartbike-iot-e3e31.firebasestorage.app",
  messagingSenderId: "1070261965567",
  appId: "1:1070261965567:web:758a0f0464ba3b1c7232ca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
const functions = getFunctions(app, "us-central1"); // تأكدي من تطابق المنطقة (Region) مع مشروعك

// دالة الاتصال بالـ Function الخاصة بالتحقق
export const verifyIdentityFunction = httpsCallable(functions, "verifyIdentity");

// دالة رفع الصور عبر Cloud Function (بدون CORS)
export async function uploadImageToStorage(base64Image, userId, type) {
  try {
    const response = await verifyIdentityFunction({
      base64Image,
      userId,
      type,
      action: 'upload' // علشان نميز بين upload و verify
    });

    if (response.data.success) {
      return response.data.downloadURL;
    } else {
      throw new Error(response.data.error || "Upload failed");
    }
  } catch (error) {
    console.error("Error uploading to Firebase Storage:", error);
    throw error;
  }
}