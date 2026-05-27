const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const usersCollection = db.collection('users');
const productsCollection = db.collection('products');

app.get('/users', async (req, res) => {
  try {
    const snapshot = await usersCollection.get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const doc = await usersCollection.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener usuario' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const snapshot = await productsCollection.get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ mensaje: 'Error productos' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const apiKey = process.env.FIREBASE_API_KEY;
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(401).json({ mensaje: data.error?.message || 'Error login' });
    }
    res.json({ uid: data.localId, token: data.idToken, email: data.email });
  } catch (error) {
    console.error('Error servidor login:', error);
    res.status(500).json({ mensaje: 'Error servidor login' });
  }
});

app.get('/', (req, res) => {
  res.send('Backend SWES funcionando 🚀');
});

exports.api = functions.https.onRequest(app);
