import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCaR7hxT-4r7XT_D_qAe7_IrOggE7HJIw8",
  authDomain: "careergpt-9d016.firebaseapp.com",
  projectId: "careergpt-9d016",
  storageBucket: "careergpt-9d016.appspot.com",
  messagingSenderId: "825342498527",
  appId: "1:825342498527:web:6c0b424016e7cead5a3b6a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
