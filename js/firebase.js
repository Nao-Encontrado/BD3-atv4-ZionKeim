import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCGkbxxnHgHPphSHrPA2g59LKucpx6qpxs",
    authDomain: "bd3-atv4-firestore.firebaseapp.com",
    projectId: "bd3-atv4-firestore",
    storageBucket: "bd3-atv4-firestore.firebasestorage.app",
    messagingSenderId: "814400065057",
    appId: "1:814400065057:web:6e68c5d181f2751cae9d60"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };