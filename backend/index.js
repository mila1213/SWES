const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { auth, db } = require("./firebase");
const { sendEmail } = require("./utils/sendEmail");

const API_KEY =
  process.env.FIREBASE_API_KEY ||
  "TU_API_KEY_FIREBASE";

const app = express();

// ======================
// CORS
// ======================
app.use(cors({
  origin: [
    "https://swes-baaa7.web.app",
    "https://swes-baaa7.firebaseapp.com",
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ======================
// ADMIN EMAILS
// ======================
const ADMIN_EMAILS = [
  "leonor.yumi@epn.edu.ec",
  "camila.bueno@epn.edu.ec",
  "concepcion.arequipa@epn.edu.ec",
].map(e => e.toLowerCase());

// ======================
// USERS COLLECTION (NUEVO)
// ======================
const usersCollection = db.collection("users");

// ======================
// USERS ENDPOINTS (NUEVO)
// ======================

// OBTENER TODOS LOS USUARIOS
app.get("/api/users", async (req, res) => {
  try {
    const snapshot = await usersCollection.get();

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
});

// OBTENER USUARIO POR ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const doc = await usersCollection.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener usuario" });
  }
});

// ======================
// PRODUCTS COLLECTION
// ======================
const productCollection = db.collection("products");

app.get("/api/products", async (req, res) => {
  try {
    const snapshot = await productCollection.get();
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(products);
  } catch (error) {
    res.status(500).json({ mensaje: "Error productos" });
  }
});

// ======================
// LOGIN (igual que el tuyo)
// ======================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const url =
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({
        mensaje: data.error?.message || "Error login"
      });
    }

    res.json({
      uid: data.localId,
      token: data.idToken,
      email: data.email
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error servidor login" });
  }
});

// ======================
// ROOT
// ======================
app.get("/", (req, res) => {
  res.send("Backend SWES funcionando 🚀");
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});