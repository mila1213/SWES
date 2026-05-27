const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let credential;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    credential = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("FIREBASE_SERVICE_ACCOUNT debe ser JSON válido:", error.message);
    process.exit(1);
  }
} else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  credential = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
} else {
  const localKeyPath = path.join(__dirname, "serviceAccountKey.json");

  if (fs.existsSync(localKeyPath)) {
    credential = require(localKeyPath);
  } else {
    console.error("No se pudo cargar credenciales de Firebase. Define FIREBASE_SERVICE_ACCOUNT o las variables FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.");
    process.exit(1);
  }
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(credential),
  });
} catch (error) {
  console.error("Error inicializando Firebase Admin:", error.message);
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { auth, db };