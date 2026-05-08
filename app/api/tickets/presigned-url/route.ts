import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileType, fileSize } = await req.json();

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: "Missing file details" },
        { status: 400 },
      );
    }

    // Validation
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (fileSize > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5MB limit" },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const bucketName = process.env.AWS_S3_TICKETS_BUCKET;
    if (!bucketName) {
      return NextResponse.json(
        { error: "S3 bucket not configured" },
        { status: 500 },
      );
    }

    // Generate unique file key
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${fileName}`;
    const fileKey = `tickets/${session.user.id}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // 60 seconds expiration

    return NextResponse.json({
      signedUrl,
      fileKey,
      fileUrl: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
