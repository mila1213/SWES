import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';

export const getAll = async (resource) => {
  const snapshot = await getDocs(collection(db, resource));
  return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
};

export const getById = async (resource, id) => {
  const docRef = doc(db, resource, id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const getByUserId = async (resource, userId) => {
  const q = query(collection(db, resource), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
};

export const createResource = async (resource, data) => {
  const docRef = await addDoc(collection(db, resource), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, ...data };
};

export const updateResource = async (resource, id, data) => {
  const docRef = doc(db, resource, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return { id, ...data };
};

export const deleteResource = async (resource, id) => {
  await deleteDoc(doc(db, resource, id));
  return { id };
};

export default { getAll, getById, getByUserId, createResource, updateResource, deleteResource };
