import { NextResponse } from "next/server";

export const runtime = "nodejs"; // we need Node APIs for parsing

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = (file as File).name || "file";
    const ext = filename.toLowerCase().split(".").pop();

    let text = "";

    if (ext === "pdf") {
      const mod = await import("pdf-parse");
      const pdfParse: any = (mod as any).default || (mod as any);
      const data = await pdfParse(buffer);
      text = data.text || "";
    } else if (ext === "docx") {
      const mod = await import("mammoth");
      const mammoth: any = (mod as any).default || (mod as any);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || "";
    } else if (ext === "txt") {
      text = buffer.toString("utf8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to extract text" },
      { status: 500 }
    );
  }
}
