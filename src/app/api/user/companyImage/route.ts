import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "testeSIH";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const filename = req.nextUrl.searchParams.get("file");

  if (!token || !filename) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);

    const filePath = path.join(process.cwd(), "src", "assets", "imgs", "companyImages", filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
