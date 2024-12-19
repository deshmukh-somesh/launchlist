### we have install next js

### we have created MaxWidthWrapper.tsx

1. createing the landing page. -> done
2. Mking the landing page look awesome -> done
3. createing the navbar -> done
4. Authentication -> done
5. Creating our Dashboard -> done
6. Syncing our database -> done
7. tRPC setup -> done
8. Creating our Database -> done
9. Finishing our database sync -> done
10. Perfecting our dashboard -> done
11. Let Users Delete Files -> done
12. Dyncamic DAta Fetching in NextJs -> done 
13. Designing our Product Page -> done 
14. Creating our File Uploader -> done 
15. Setting up UploadThing -> done 
16. Perfecting our file uploader -> done 
17. Rendering PDF files -> done 
18. Feature Bar for PDF Renderer -> done 
19. Creating the Messages Section -> done
20. Instant Loading States -> done 
21. Creatin our Chat Input -> done 
22. Making Components work together using Context -> done 
23. Streaming API Response in Real-time -> done 
24. Receiving Stream on the Client -> done 
25. Infinite Queries for Performace -> done 
26. Displaying Messages
27. Optimistic Updates for Instatnt Feedback
28. Infinite Queries & Streaming Demo
29. Stripe Setup
30. Creating our Pricing Page
31. Pagyment Integreation
32. Subscription mnagement Page
33. Preview Deployment
34. Finishing the Navbar When Logged In
35. Making Link Previews Look Beautiful
36. Give Pro Plan Better Feature
37. Deployment to VErcle and final test.

### installing

npm install clsx tailwind-merge

what twMerge does is ?
=> if we have pt-2 pb-2 -> it will merge and give -> p-2

clsx does is ? ->
if we have bg-green-200 bg-red-200 it shall do some process , please chatgpt to get more insights.

### we now install : tailwindcss-animate

## npm install tailwindcss-animate

### also we will install : @tailwindcss/typography

### npm install @tailwindcss/typography

add these in the plugins of the tailwind.config.ts file

### icon library

### npm install lucide-react

###### installing shadcn library :

npx shadcn-ui@latest add button
as we are installing it for first time it will throw an error
"Configuration is missing. Please run init to create a components.json file."

#### npx shadcn-ui@latest init

we took
default
zinc
css variables yes

## we got the button created.

we got the starting page setup for ourself. \

For authentication we are making use of -> kinde-oss/kinde-auth-nextjs

### installing kinde-oss/kinde-auth-nextjs

### npm install kinde-oss/kinde-auth-nextjs

### Building dashboard

#### also current user.

##### we will be handling the user session also.

#### when we upload a file in the, it also needs to go to db for that we will require database and not just the authentication part.

#### we need to sync the data to the database.

### the way we can achieve that , is from the code.

### now we will learn how user is sent to the database:

we created a folder caleed

purpose of auth callback is that the data is synced to the db.

s
we check if the user is present in the db , if not we will create one , if alreay present we will move to the next step.

#### For database we make use of prism

npx prisma init

#### let see if we have setup our database currectly :

#### command: npx prisma db push -> what this command will do is -> what we have written in the local database is pushed into the cloud , you can check it in the

### to get the access to the types locally, we use the command :

### -> npx prisma generate

### now are going to make use of `npx prisma studio`

##### we will be installing model component from shedcn called -> dialog

npx shadcn-ui@latest add dialog

## using this to build dashboard.

### Now we are creating file upload model , whenever the user uploads a pdf.

#### each user can have multiple files in the array of files.

### push these changes to the db using the command : npx prisma db push

now we do have the files database now we will make use fo trpc

### we can't make use of publicProcedure in trpc index.ts file as publicProcdure can be called by any , now to achieve the files we need something that only user of this should be able to query this part and not some one else .

### to display the files we are going to use full power of trpc

now we are adding loading state , the way we are going to do that is ,

##### npm install react-loading-skeleton

#### we are making use of

when we tried rendering date , we get is some uncertain date , to make it proper we make use of light weight package called.

npm install date-fns

fns stands for functions

#### for deleting file

### which file is specifically being deleted , we need to know it.

so we make use of states to do the necessary thing.

### localhost:3000/dashboard/clmutxpi50003uhiomazjovya

-> clmutxpi50003uhiomazjovya -> params

### when we are trying to navigate to "localhost:3000/dashboard/clmutxpi50003uhiomazjovya", now we will require to check if the user is logged in or not.

### to render the pdf's , we installed something called:

#### npm install react-pdf

### react library that helps to drag and drop easily

### npm install react-dropzone

-- now we are adding cloud icon in the div tag.

### when ever user drags in file we want a loading state in there.

### we are making use of shadcn progress bar.

### npx shadcn-ui@latest add progress

### uploadthing -> an alternative to instead of using s3 bucket of aws , we can make use fo uploadthing that would help us do the things out for .

### installing uploadthing

### npm install uploadthing

### lib acts as an library , and could be used inside the folder.

### we added the helper function in.

### we are installing: npm install @uploadthing/react

### now we will be making use of toast message from shadcn

### npm shadcn-ui@latest add toast

### we can't reder out pdf like this only we will need a worker to do so.

#### now what has happened is when we render the pdf , we see the pdf taking very small space and the white taking very large space. we will have to render it in better way .

### to solve this problem we make use of npm install react-resize-detector.

### we are going to make use of input from shadcn library

### npx shadcn-ui@latest add input

### to check the updates of the page. that is the input beside the X in the pdf to go front and back , we have a very nice dependecy that we can make use of .

### these two codes don't work as written they need to be connected the types.

### we need the package to do that -> npm install @hookform/resolvers

### now we are going to build drop down that will show us the the zoom percentage.

### npx shadcn-ui@latest add dropdown-menu

### after all the logic that we implemented. we see if we chage the 100% zoom to 150% zoom the width of the page increases drastically. Need to work on that.

### for that we are installing

### npm install simplebar-react

### now we are making use of react-hook-form

### the textarea is installed from the shadcn lib

### now there is no functionality of adding resizable text area. so for that we will install a package called

### npm install react-textarea-autosize

### new thing that we learnt :-> add message Messge[] field , added file File[] field in the User model 

### when we do local chages on prisma we do npx prisma db push
###  then npx prisma generate 

### setup the pinecone for the vector database.

##### package to be installed for that. 

### we installed something called npm install pdf-parse
 


<!-- import {Pinecone as PineconeClient} from '@pinecone-database/pinecone'

export const getPineconeClient = async()=>{
    const client = new PineconeClient()

    await client.init({
        apikey:process.env.PINECONE_API_KEY!,
        environment:'us-east1-aws'
    })
    return client
} -->


<!-- import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user || !user.id) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        if (!file.key || !metadata.userId) {
          throw new Error("Invalid file metadata");
        }

        const createdFile = await db.file.create({
          data: {
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            url: `https://utfs.io/f/${file.key}`, // Use the correct URL format
            uploadStatus: "PROCESSING",
          },
        });

        try {
          // Fetch the file using the correct URL
          const response = await fetch(`https://utfs.io/f/${file.key}`);
          if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

          const blob = await response.blob();
          console.log("File fetched successfully");

          const loader = new PDFLoader(blob);
          const pageLevelDocs = await loader.load();
          console.log(`PDF loaded successfully. Pages: ${pageLevelDocs.length}`);

          // const pinecone = getPineconeClient();
          const pineconeIndex = pinecone.Index('docask');
          console.log("Pinecone client initialized");

          const embeddings = new OpenAIEmbeddings({
            apiKey: process.env.OPENAI_API_KEY
          });
          console.log("OpenAI embeddings initialized");

          await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
            pineconeIndex,
            namespace: createdFile.id
          });
          console.log("Documents stored in Pinecone");

          await db.file.update({
            data: { uploadStatus: "SUCCESS" },
            where: { id: createdFile.id }
          });
          console.log("File status updated to SUCCESS");

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
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; -->


### we are making use of ### npm install ai , this is vercel package provided, helps a lot. 


### we are making use of npm install react-markdown -> here we can do more customization like list tags , unordered list tags. 

### we are installing something called npm install @mantine/hooks -> for rendering the more message if we scroll up. 


### now we have setup plot for the pricing , 

### npx shadcn-ui@latest add tooltip 


"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/app/_trpc/client";
import { useState } from "react";

const UpgradeButton = () => {
  const [loading, setLoading] = useState(false); // To manage loading state
  
  const { mutate: createStripeSession } = trpc.createStripeSession.useMutation({
    onSuccess: ({ url }) => {
      setLoading(false); // Stop loading
      // Redirect to the Stripe checkout page or billing dashboard
      window.location.href = url ?? "/dashboard/billing";
    },
    onError: (error) => {
      setLoading(false); // Stop loading
      console.error("Error creating Stripe session:", error);
      alert("Failed to create session. Please try again.");
    },
  });

  const handleUpgradeClick = () => {
    setLoading(true); // Set loading to true when the button is clicked
    createStripeSession();
  };

  return (
    <Button className="w-full" onClick={handleUpgradeClick} disabled={loading}>
      {loading ? "Loading..." : "Upgrade now"}
      {!loading && <ArrowRight className="h-5 w-5 ml-1.5" />}
    </Button>
  );
};

export default UpgradeButton;



/*** most imp file of life ***/


import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  console.log("Entering dashboard page");
  
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  console.log("User from getUser:", user);

  if (!user || !user.id) {
    console.log("User not found, redirecting to login");
    return redirect('/api/auth/login')
  }

  console.log("Fetching user from database");
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });
  console.log("DB User:", dbUser);

  if (!dbUser) {
    console.log("DB User not found, redirecting to auth-callback");
    return redirect('/auth-callback?origin=dashboard')
  }

  console.log("Fetching subscription plan");
  const subscriptionPlan = await getUserSubscriptionPlan()
  console.log("Subscription plan:", subscriptionPlan);

  console.log("Rendering Dashboard component");
  return <Dashboard subscriptionPlan={subscriptionPlan}/>
}

export default Page;



<!-- notes for git= -->

I'll help you merge your 'react-joy' branch into master. Here are the steps using both Git command line and GitHub:
Using Git Command Line:

# 1. First switch to master branch
git checkout master

# 2. Pull latest changes from master to ensure you're up to date
git pull origin master

# 3. Merge react-joy branch into master
git merge react-joy

# 4. Push the changes to remote repository
git push origin master



Alternative Method Using GitHub UI:
Go to your GitHub repository
Click on "Pull requests" tab
Click "New pull request"
Set:
base branch: master
compare branch: react-joy
Click "Create pull request"
Add a title and description
Click "Create pull request"
Once reviewed, click "Merge pull request"
If you encounter conflicts:



# 1. Fix conflicts in your code editor
# 2. After fixing, mark as resolved
git add .

# 3. Continue the merge
git commit -m "Resolved merge conflicts"

# 4. Push changes
git push origin master



<!--  cron job added successfully  -->

$ curl -X GET http://localhost:3000/api/cron \
>   -H "Authorization: Bearer 1234567890"
{"success":true}



### how it works 

Steps Explained
1. Setting the Current Date
typescript
Copy code
const today = new Date(new Date().setHours(0, 0, 0, 0));
This creates a Date object representing the start of the current day (00:00:00).
It ensures that the usage is checked against the current day for daily limits.
2. Retrieving Subscription Plan
typescript
Copy code
const subscriptionPlan = await getUserSubscriptionPlan();
const limits: FeatureLimits = getFeatureLimits(feature, subscriptionPlan.isSubscribed);
getUserSubscriptionPlan() fetches the user's subscription details to check if they are subscribed to a paid plan (e.g., Pro).
getFeatureLimits(feature, subscriptionPlan.isSubscribed) retrieves the usage limits (daily and monthly) for the feature, depending on the user's subscription.
3. Fetching or Initializing Usage Data
The function uses two parallel database queries via Promise.all:

User's Monthly Usage:

typescript
Copy code
db.userUsage.upsert({
  where: { userId },
  create: {
    userId,
    pdfCount: 0,
    flashcards: 0,
    quizzes: 0,
    notes: 0,
    resetDate: today
  },
  update: {}
});
Purpose: Ensures there is a record of the user's total monthly usage.
Behavior:
If the record for userId doesn't exist, it creates a new entry with usage counts set to 0.
If it exists, it doesn't update anything (update: {}).
User's Daily Usage for the Feature:

typescript
Copy code
db.featureUsage.upsert({
  where: {
    userId_feature_resetDate: {
      userId,
      feature,
      resetDate: today
    }
  },
  create: {
    userId,
    feature,
    count: 0,
    resetDate: today
  },
  update: {}
});
Purpose: Tracks how many times the feature was used today.
Behavior:
If no record exists for userId, feature, and resetDate, it creates one with count: 0.
If a record exists, it does not update it.
By using upsert, the function ensures that required records always exist without having to check for their existence beforehand.

