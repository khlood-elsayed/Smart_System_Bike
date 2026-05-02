import { db } from "../../firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function logAdminAction(action, details) {
  try {
    const operator = sessionStorage.getItem("activeAdminName") || "System_AI";
    
    await addDoc(collection(db, "admin_logs"), {
      timestamp: serverTimestamp(),
      operator,
      action,
      details,
      isSystem: operator === "System_AI"
    });
    
  } catch(err) {
    console.error("Admin Log Write Failed", err);
  }
}
