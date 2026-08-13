// this is the server side workhorse, it receive the file, validate it, stores it, and write the DB row.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: User not authenticated" },
        { status: 401 },
      );
    }

    // validate presense and type of the file
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, PNG, or JPG files are allowed" },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 10MB limit" },
        { status: 400 },
      );
    }

    // store the file in vercel blob storage
    const blob = await put(file.name, file, {
      access: "private",
      addRandomSuffix: true,
    });

    // write the DB row
    const document = await prisma.document.create({
      data: {
        userId,
        fileName: file.name,
        filePath: blob.url,
        status: "pending",
      },
    });

    return NextResponse.json(
      { message: "File uploaded successfully", document },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
