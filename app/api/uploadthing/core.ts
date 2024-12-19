import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";

// import { getUserSubscriptionPlan } from "@/lib/stripe"
import {getUserSubscriptionPlan} from '@/lib/razorpay'

import { PLANS } from "@/config/razorpay";
import { checkFeatureAccess } from "@/lib/services/usage-service";


const f = createUploadthing();
// const middleware = async()=>{
//   const { getUser } = getKindeServerSession();
//   const user = await getUser();

//   if (!user || !user.id) throw new Error("Unauthorized");

//   const subscriptionPlan = await getUserSubscriptionPlan()

//   return {subscriptionPlan,  userId: user.id };
// }

const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) throw new Error("Unauthorized");

  const subscriptionPlan = await getUserSubscriptionPlan();
  const canUpload = await checkFeatureAccess(user.id, 'pdf');
  
  if (!canUpload) {
    throw new UploadThingError("Free tier PDF limit reached");
  }

  return { subscriptionPlan, userId: user.id };
};

const onUploadComplete = async ({

  metadata, file
}:{
  metadata: Awaited<ReturnType<typeof middleware>>
  file: {
    key:string
    name: string
    url: string
  }
})=>{
  try {
    if (!file.key || !metadata.userId) {
      throw new Error("Invalid file metadata");
    }

    const isFileExists = await db.file.findFirst({
      where:{
        key:file.key
      }
    })

    if(isFileExists) return 

    const createdFile = await db.file.create({
      data: {
        key: file.key,
        name: file.name,
        userId: metadata.userId,
        url: `https://utfs.io/f/${file.key}`,
        uploadStatus: "PROCESSING",
      },
    });

    try {
      const response = await fetch(`https://utfs.io/f/${file.key}`);
      if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

      const blob = await response.blob();

      const loader = new PDFLoader(blob);
      const pageLevelDocs = await loader.load();
      const pagesAmt = pageLevelDocs.length

      const {subscriptionPlan}  = metadata
      const{isSubscribed}= subscriptionPlan  
      
      const isProExceeded = pagesAmt > PLANS.find((plan)=> plan.name==="Pro")!.pagesPerPdf
      const isFreeExceeded = pagesAmt > PLANS.find((plan)=> plan.name==="Free")!.pagesPerPdf


      if((isSubscribed && isProExceeded ) || (!isSubscribed && isFreeExceeded)){
        await db.file.update({
          data: {
            uploadStatus: 'FAILED'
          },
          where: {
            id: createdFile.id
          }
        })
      }
      

      const pineconeIndex = pinecone.Index('docask');

      const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY
      });

      await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
        pineconeIndex,
        namespace: createdFile.id
      });

      await db.file.update({
        data: { uploadStatus: "SUCCESS" },
        where: { id: createdFile.id }
      });

    } catch (err) {
      console.error("Error processing PDF:", err);
      await db.file.update({
        data: { uploadStatus: "FAILED" },
        where: { id: createdFile.id }
      });
    }

  } catch (error) {
    console.error("Error creating file in database:", error);
    throw new UploadThingError("Error saving file information");
  }
}

export const ourFileRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "32MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;