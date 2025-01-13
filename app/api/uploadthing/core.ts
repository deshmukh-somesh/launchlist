// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";

const f = createUploadthing();

const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) throw new Error("Unauthorized");

  return { userId: user.id };
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: { userId: string };
  file: { key: string; name: string; url: string };
}) => {
  try {
    // Create entry in FileUpload table
    await db.fileUpload.create({
      data: {
        key: file.key,
        name: file.name,
        url: file.url,
        userId: metadata.userId,
      },
    });

    return { url: file.url };
  } catch (error) {
    console.error("Error saving file:", error);
    throw new Error("Failed to save file information");
  }
};

export const ourFileRouter = {
  productImage: f({ 
    image: { 
      maxFileSize: "4MB",
      maxFileCount: 1 
    } 
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;