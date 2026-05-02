// Debug script to test Firebase listeners
import { db, auth } from './src/firebase.js';
import { collection, onSnapshot, doc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

console.log("🔍 Starting Firebase Listener Debug...\n");

// Check Auth Status
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ User Authenticated:", user.uid, user.email);
    } else {
        console.log("❌ NO USER LOGGED IN - Listeners may not work!");
    }
});

// Test 1: Try to listen to bikes collection
console.log("\n📡 Test 1: Listening to 'bikes' collection...");
try {
    const unsub1 = onSnapshot(collection(db, "bikes"), (snap) => {
        console.log(`✅ Bikes listener triggered! Found ${snap.docs.length} bikes`);
        snap.docs.forEach(doc => {
            console.log("  - Bike ID:", doc.id, "Data:", doc.data());
        });
    }, (error) => {
        console.error("❌ Bikes listener ERROR:", error.code, error.message);
    });

    // Keep listening for 5 seconds
    setTimeout(() => { unsub1(); console.log("Bikes listener stopped."); }, 5000);
} catch (err) {
    console.error("❌ Bikes listener setup ERROR:", err);
}

// Test 2: Try to listen to users collection
console.log("\n📡 Test 2: Listening to 'users' collection...");
try {
    const unsub2 = onSnapshot(collection(db, "users"), (snap) => {
        console.log(`✅ Users listener triggered! Found ${snap.docs.length} users`);
        snap.docs.slice(0, 2).forEach(doc => {
            console.log("  - User ID:", doc.id, "Phone:", doc.data().phone);
        });
    }, (error) => {
        console.error("❌ Users listener ERROR:", error.code, error.message);
    });

    setTimeout(() => { unsub2(); console.log("Users listener stopped."); }, 5000);
} catch (err) {
    console.error("❌ Users listener setup ERROR:", err);
}

// Test 3: Try getDocs (one-time query)
console.log("\n📡 Test 3: One-time getDocs from 'bikes'...");
try {
    getDocs(collection(db, "bikes")).then((snap) => {
        if (snap.docs.length > 0) {
            console.log(`✅ getDocs SUCCESS! Found ${snap.docs.length} bikes`);
        } else {
            console.log("⚠️ getDocs returned empty collection");
        }
    }).catch(err => {
        console.error("❌ getDocs ERROR:", err.code, err.message);
    });
} catch (err) {
    console.error("❌ getDocs setup ERROR:", err);
}
