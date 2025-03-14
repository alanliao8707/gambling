import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDpOE0h9JEJFO54kUQvKXuVCTYDwRHaxsQ",
  authDomain: "gambling-record-app.firebaseapp.com",
  projectId: "gambling-record-app",
  storageBucket: "gambling-record-app.appspot.com", // ✅ 修正 storageBucket 錯誤
  messagingSenderId: "1097718676650",
  appId: "1:1097718676650:web:0742adb77d2c09ad5d24d3",
  measurementId: "G-XCX09NFKLY"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };


