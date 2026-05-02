import { db } from './src/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function checkCollections() {
  const collections = ['bikes', 'docks', 'users'];
  
  for (const collName of collections) {
    try {
      const q = collection(db, collName);
      const snap = await getDocs(q);
      console.log(`Collection [${collName}]: ${snap.size} documents found.`);
      if (snap.size > 0) {
        console.log(`Sample [${collName}]:`, snap.docs[0].data());
      }
    } catch (e) {
      console.error(`Error checking [${collName}]:`, e.message);
    }
  }
}

checkCollections();
