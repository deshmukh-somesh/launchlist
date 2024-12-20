import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "../uploadthing";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>(); 