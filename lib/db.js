import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readDb() {
  ensureDir();
  if (!fs.existsSync(USERS_FILE)) return { users: [] };
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    return { users: [] };
  }
}

function writeDb(data) {
  ensureDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

export function findUserByEmail(email) {
  const { users } = readDb();
  return users.find((u) => u.email === email.toLowerCase()) || null;
}

export function findUserById(id) {
  const { users } = readDb();
  return users.find((u) => u.id === id) || null;
}

export function createUser({ name, email, passwordHash }) {
  const db = readDb();
  const user = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    studies: [],
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDb(db);
  return user;
}

export function getUserStudies(userId) {
  const user = findUserById(userId);
  return user?.studies || [];
}

export function addStudy(userId, study) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("Usuário não encontrado.");
  user.studies = [study, ...(user.studies || [])];
  writeDb(db);
  return study;
}

export function removeStudy(userId, studyId) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("Usuário não encontrado.");
  user.studies = (user.studies || []).filter((s) => s.id !== studyId);
  writeDb(db);
}
