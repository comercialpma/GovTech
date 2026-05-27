import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missing = requiredVars.filter((key) => !import.meta.env[key]);
if (missing.length > 0) {
  throw new Error(
    `[firebaseConfig] Variáveis de ambiente ausentes: ${missing.join(', ')}.\n` +
    `Verifique se o arquivo .env.${import.meta.env.MODE} existe na raiz e foi carregado pelo Vite.`
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'southamerica-east1';

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, region);

// Conexão automática com emuladores em desenvolvimento
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  console.info(
    `[firebaseConfig] Modo emulador ATIVO — projeto: ${firebaseConfig.projectId}`
  );
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
} else {
  console.info(
    `[firebaseConfig] Conectado ao projeto: ${firebaseConfig.projectId} (${import.meta.env.MODE})`
  );
}

export default app;
