const admin = require("firebase-admin");

// Usamos el servicio de Google para cargar credenciales desde el entorno
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Esto limpia los saltos de línea de la clave privada
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { auth, db };