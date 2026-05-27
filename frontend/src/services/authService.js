import { auth, db } from '../../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  applyActionCode,
  confirmPasswordReset,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const usersCollection = 'users';

const normalizeProfile = (user, profile = {}) => ({
  uid: user.uid,
  email: user.email || profile.email || '',
  name: profile.name || user.displayName || '',
  role: profile.role || 'visitante',
  phone: profile.phone || '',
});

const getUserProfile = async (uid) => {
  const userRef = doc(db, usersCollection, uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

const saveUserProfile = async (user, profile = {}) => {
  const userRef = doc(db, usersCollection, user.uid);
  const existing = await getUserProfile(user.uid);

  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email || profile.email || '',
      name: profile.name || user.displayName || '',
      role: profile.role || 'visitante',
      phone: profile.phone || '',
      createdAt: existing?.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return normalizeProfile(user, {
    ...existing,
    ...profile,
  });
};

export const registerUser = async ({ nombre, email, password, role, phone }) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return saveUserProfile(userCredential.user, {
    name: nombre,
    role,
    phone,
  });
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(userCredential.user.uid);
  const token = await userCredential.user.getIdToken();
  return { ...normalizeProfile(userCredential.user, profile || {}), token };
};

export const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const profile = await saveUserProfile(result.user, {
    role: 'visitante',
  });
  const token = await result.user.getIdToken();
  return { ...profile, token };
};

export const verifyAccount = async (oobCode) => {
  await applyActionCode(auth, oobCode);
  return { message: 'Cuenta verificada correctamente.' };
};

export const resetPassword = async (oobCode, newPassword) => {
  await confirmPasswordReset(auth, oobCode, newPassword);
  return { message: 'Contraseña actualizada correctamente.' };
};