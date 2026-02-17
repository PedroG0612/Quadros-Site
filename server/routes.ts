import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import MemoryStore from "memorystore";
import uploadRouter from "./upload";
import express from "express";
import path from "path";

const scryptAsync = promisify(scrypt);
const SessionStore = MemoryStore(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth Setup
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new SessionStore({ checkPeriod: 86400000 }),
      resave: false,
      saveUninitialized: false,
      secret: "minimalist_art_gallery_secret",
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Upload Router and Static Files
  app.use(uploadRouter);
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth Routes
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const existing = await storage.getUserByUsername(req.body.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send(null);
    res.json(req.user);
  });

  // Artwork Routes
  app.get(api.artworks.list.path, async (req, res) => {
    const artworks = await storage.getArtworks();
    res.json(artworks);
  });

  app.post(api.artworks.create.path, async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const input = api.artworks.create.input.parse(req.body);
      const artwork = await storage.createArtwork(input);
      res.status(201).json(artwork);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      throw err;
    }
  });

  app.put(api.artworks.update.path, async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const input = api.artworks.update.input.parse(req.body);
      const artwork = await storage.updateArtwork(Number(req.params.id), input);
      if (!artwork) return res.status(404).json({ message: "Artwork not found" });
      res.json(artwork);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      throw err;
    }
  });

  app.delete(api.artworks.delete.path, async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await storage.deleteArtwork(Number(req.params.id));
    res.sendStatus(204);
  });

  return httpServer;
}
