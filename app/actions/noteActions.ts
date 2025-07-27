// app/actions/noteActions.ts
"use server";

import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth"; 


const prisma = new PrismaClient();

export async function createNote({ title, content }: { title: string; content: string }) {
  const session = await getServerSession(authOptions); 
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const newNote = await prisma.note.create({
    data: {
      title,
      content,
      authorId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  return newNote;
}

export async function getNotes() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const notes = await prisma.note.findMany({
    where: {
      authorId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notes;
}

export async function deleteNote(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const note = await prisma.note.findUnique({
    where: { id },
  });

  if (note?.authorId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await prisma.note.delete({
    where: { id },
  });

  revalidatePath("/dashboard");
}