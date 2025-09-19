import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Naive auth: take user from header or use a demo one.
app.use(async (req, _res, next) => {
  const userId = (req.headers["x-user-id"] as string) || "demo-user";
  (req as any).userId = userId;

  // Ensure a User row exists (id is a stable string; email is placeholder)
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: `${userId}@example.com` },
  });

  next();
});

// List notes (not archived)
app.get("/api/notes", async (req, res) => {
  const userId = (req as any).userId as string;
  const notes = await prisma.note.findMany({
    where: { userId, archived: false },
    orderBy: { updatedAt: "desc" },
  });
  res.json(notes);
});

// Create note
app.post("/api/notes", async (req, res) => {
  const userId = (req as any).userId as string;
  const { title, content } = req.body ?? {};
  const note = await prisma.note.create({ data: { title, content, userId } });
  res.status(201).json(note);
});

// Update (title/content/archived)
app.put("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, archived } = req.body ?? {};
  const note = await prisma.note.update({
    where: { id },
    data: { title, content, archived },
  });
  res.json(note);
});

// Delete
app.delete("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.note.delete({ where: { id } });
  res.status(204).end();
});

app.get("/", (req, res) => {
    res.send("✅ Server is running!");
  });
  
app.listen(3000, () => console.log("API running at http://localhost:3000"));
