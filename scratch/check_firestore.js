import { db } from './src/firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

async function checkUser() {
  const phone = "01000000000";
  const q = query(collection(db, "users"), where("phone", "==", phone));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    console.log(`❌ User with phone ${phone} NOT FOUND in Firestore.`);
  } else {
    console.log(`✅ Found ${querySnapshot.size} user(s) with phone ${phone}:`);
    querySnapshot.forEach(doc => {
      console.log('ID:', doc.id, 'Data:', doc.data());
    });
  }
}

checkUser();
