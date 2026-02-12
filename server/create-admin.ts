import { db } from "./db";
import { users } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdmin() {
  const username = "admin";
  const password = "admin_password_123";
  const hashedPassword = await hashPassword(password);

  try {
    await db.insert(users).values({
      username,
      password: hashedPassword,
      isAdmin: true,
    });
    console.log("Admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin_password_123");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
  process.exit(0);
}

createAdmin();
