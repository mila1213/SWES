const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { auth, db } = require("./firebase");
const { sendEmail } = require("./utils/sendEmail");

const API_KEY =
  process.env.FIREBASE_API_KEY || "TU_API_KEY_FIREBASE";

const app = express();

// =======================================
// CORS
// =======================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://TU-PROYECTO.web.app",
      "https://TU-PROYECTO.firebaseapp.com",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// =======================================
// CORREOS DE ADMINISTRADORES
// =======================================

const ADMIN_EMAILS = [
  "leonor.yumi@epn.edu.ec",
  "camila.bueno@epn.edu.ec",
  "concepcion.arequipa@epn.edu.ec",
].map((email) => email.toLowerCase());

// =======================================
// OBTENER ROL
// =======================================

const getRoleByEmail = (email) => {
  if (!email) return "visitante";

  const normalized = email.toLowerCase().trim();

  if (ADMIN_EMAILS.includes(normalized)) {
    return "administrador";
  }

  if (normalized.endsWith("@epn.edu.ec")) {
    return "emprendedor";
  }

  return "visitante";
};

// =======================================
// NORMALIZAR TELÉFONO
// =======================================

const normalizePhone = (phone) => {
  if (!phone) return "";
  return String(phone).replace(/\D/g, "");
};

// =======================================
// GUARDAR PERFIL
// =======================================

const saveUserProfile = async (uid, profile) => {
  await db.collection("users").doc(uid).set(profile, {
    merge: true,
  });
};

// =======================================
// CARGAR PERFIL
// =======================================

const loadUserProfile = async (uid) => {
  const doc = await db.collection("users").doc(uid).get();

  return doc.exists ? doc.data() : null;
};

// =======================================
// CREAR ADMINS
// =======================================

const ensureAdminAccounts = async () => {
  for (const email of ADMIN_EMAILS) {
    try {
      let user;

      try {
        user = await auth.getUserByEmail(email);

        console.log(`Admin existente: ${email}`);
      } catch {
        user = await auth.createUser({
          email,
          password: "123456",
          emailVerified: true,
        });

        console.log(`Admin creado: ${email}`);
      }

      await saveUserProfile(user.uid, {
        email,
        role: "administrador",
        nombre: email.split("@")[0],
        phone: "",
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error creando admin ${email}:`, error.message);
    }
  }
};

ensureAdminAccounts();

// =======================================
// HOME
// =======================================

app.get("/", (req, res) => {
  res.send("API Firebase funcionando");
});

// =======================================
// REGISTER
// =======================================

app.post("/api/register", async (req, res) => {
  try {
    const { email, password, nombre, role, phone } = req.body;

    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedPhone = normalizePhone(phone);

    const selectedRole = role || "visitante";

    if (!normalizedEmail || !password || !nombre) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios",
      });
    }

    if (!normalizedEmail.endsWith("@epn.edu.ec")) {
      return res.status(400).json({
        mensaje: "Debes usar un correo institucional",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener mínimo 6 caracteres",
      });
    }

    if (
      selectedRole === "emprendedor" &&
      !normalizedPhone
    ) {
      return res.status(400).json({
        mensaje: "El teléfono es obligatorio",
      });
    }

    if (selectedRole === "administrador") {
      return res.status(403).json({
        mensaje: "No puedes registrar administradores",
      });
    }

    const signUpUrl =
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;

    const signUpRes = await fetch(signUpUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: normalizedEmail,
        password,
        returnSecureToken: true,
      }),
    });

    const signUpData = await signUpRes.json();

    if (!signUpRes.ok) {
      const errorCode = signUpData.error?.message;

      if (errorCode === "EMAIL_EXISTS") {
        return res.status(400).json({
          mensaje: "El correo ya está registrado",
        });
      }

      return res.status(500).json({
        mensaje: "Error al registrar usuario",
        detalle: signUpData,
      });
    }

    const profile = {
      email: normalizedEmail,
      role: selectedRole,
      nombre: nombre.trim(),
      phone: normalizedPhone,
      createdAt: new Date().toISOString(),
    };

    await saveUserProfile(signUpData.localId, profile);

    const sendVerifyUrl =
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`;

    await fetch(sendVerifyUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        requestType: "VERIFY_EMAIL",
        idToken: signUpData.idToken,
      }),
    });

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor",
      detalle: error.message,
    });
  }
});

// =======================================
// LOGIN
// =======================================

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail =
      email?.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        mensaje: "Correo y contraseña requeridos",
      });
    }

    const url =
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: normalizedEmail,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({
        mensaje:
          data.error?.message || "Credenciales inválidas",
      });
    }

    let role = "visitante";
    let phone = "";
    let nombre = "";

    const profile =
      await loadUserProfile(data.localId);

    if (profile) {
      role =
        profile.role ||
        getRoleByEmail(normalizedEmail);

      phone = profile.phone || "";
      nombre = profile.nombre || "";
    } else {
      role = getRoleByEmail(normalizedEmail);

      const newProfile = {
        email: normalizedEmail,
        role,
        nombre: "",
        phone: "",
        createdAt: new Date().toISOString(),
      };

      await saveUserProfile(
        data.localId,
        newProfile
      );
    }

    res.json({
      mensaje: "Login exitoso",
      token: data.idToken,
      uid: data.localId,
      email: data.email,
      role,
      phone,
      name: nombre,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
});

// =======================================
// GOOGLE LOGIN
// =======================================

app.post("/api/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        mensaje: "Falta idToken",
      });
    }

    const decoded =
      await auth.verifyIdToken(idToken);

    const {
      uid,
      email,
      name,
      picture,
    } = decoded;

    const normalizedEmail =
      email?.toLowerCase().trim();

    try {
      await auth.getUser(uid);

    } catch {

      await auth.createUser({
        uid,
        email: normalizedEmail,
        displayName: name || "",
        photoURL: picture || null,
      });
    }

    let role =
      getRoleByEmail(normalizedEmail);

    const existingProfile =
      await loadUserProfile(uid);

    if (!existingProfile) {
      await saveUserProfile(uid, {
        email: normalizedEmail,
        role,
        nombre: name || "",
        phone: "",
        createdAt: new Date().toISOString(),
      });
    }

    const customToken =
      await auth.createCustomToken(uid);

    res.json({
      mensaje: "Google login exitoso",
      uid,
      email: normalizedEmail,
      role,
      customToken,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error en Google Sign-In",
      detalle: error.message,
    });
  }
});

// =======================================
// PRODUCTS
// =======================================

const productCollection = db.collection("products");

app.get("/api/products", async (req, res) => {
  try {
    const snapshot = await productCollection.get();

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(products);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener productos",
    });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await productCollection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener producto",
    });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const product = {
      ...req.body,
      price: req.body.price
        ? Number(req.body.price)
        : 0,
      createdAt: new Date().toISOString(),
    };

    const docRef =
      await productCollection.add(product);

    res.status(201).json({
      id: docRef.id,
      ...product,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al crear producto",
    });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = {
      ...req.body,
      price: req.body.price
        ? Number(req.body.price)
        : 0,
      updatedAt: new Date().toISOString(),
    };

    await productCollection.doc(id).update(product);

    res.json({
      id,
      ...product,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al actualizar producto",
    });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await productCollection.doc(id).delete();

    res.json({
      mensaje: "Producto eliminado correctamente",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al eliminar producto",
    });
  }
});

// =======================================
// USERS
// =======================================

app.get("/api/users", async (req, res) => {
  try {
    const snapshot =
      await db.collection("users").get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(users);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener usuarios",
    });
  }
});

// =======================================
// CONTACTO
// =======================================

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        mensaje: "Faltan campos obligatorios",
      });
    }

    const to = ADMIN_EMAILS.join(",");

    const html = `
      <p><strong>De:</strong> ${name} &lt;${email}&gt;</p>
      <p><strong>Asunto:</strong> ${subject || "Contacto desde sitio"}</p>
      <hr />
      <div>${message.replace(/\n/g, "<br/>")}</div>
    `;

    await sendEmail({
      to,
      subject: subject || `Mensaje desde SWES: ${name}`,
      html,
      replyTo: email,
    });

    res.json({
      mensaje: "Mensaje enviado correctamente",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al enviar mensaje",
    });
  }
});

// =======================================
// INICIAR SERVIDOR
// =======================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});