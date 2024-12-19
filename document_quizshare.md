I'll help you create a quiz sharing functionality. Based on the codebase, we'll need to make several changes to enable quiz sharing and response collection. Here's a comprehensive solution:

1. First , let's add a new field to the Quiz model in the Prisma schema to track sharing status:

```
model Quiz {
  id          String    @id @default(cuid())
  title       String
  questions   Json
  fileId      String
  userId      String
  score       Float?
  attempts    Int       @default(0)
  grade       String?
  remarks     String?
  createdAt   DateTime  @default(now())
  lastAttempt DateTime?
  shareId     String?   @unique // Add this field for sharing
  isShared    Boolean   @default(false) // Add this field to control sharing status
  sharedResponses QuizResponse[] // Add this relation
  File        File      @relation(fields: [fileId], references: [id], onDelete: Cascade)
  User        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// New model for quiz responses
model QuizResponse {
  id        String   @id @default(cuid())
  quizId    String
  quiz      Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  answers   Json
  score     Float
  grade     String?
  remarks   String?
  createdAt DateTime @default(now())
  respondentName String?
  respondentEmail String?
}

```

2. Add new tRPC procedures for sharing functionality.

// trpc/index.ts

```

// trpc/index.ts
export const appRouter = router({
  // ... existing routes

  shareQuiz: privateProcedure
    .input(z.object({
      quizId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const shareId = cuid(); // Generate unique sharing ID
      
      const quiz = await db.quiz.update({
        where: {
          id: input.quizId,
          userId: ctx.userId
        },
        data: {
          shareId,
          isShared: true
        }
      });

      return {
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/shared-quiz/${shareId}`
      };
    }),

  getSharedQuiz: publicProcedure
    .input(z.object({
      shareId: z.string()
    }))
    .query(async ({ input }) => {
      const quiz = await db.quiz.findFirst({
        where: {
          shareId: input.shareId,
          isShared: true
        },
        select: {
          id: true,
          title: true,
          questions: true,
          createdAt: true
        }
      });

      if (!quiz) throw new TRPCError({ code: 'NOT_FOUND' });
      return quiz;
    }),

  submitSharedQuizResponse: publicProcedure
    .input(z.object({
      shareId: z.string(),
      answers: z.array(z.number()),
      respondentName: z.string().optional(),
      respondentEmail: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const quiz = await db.quiz.findFirst({
        where: {
          shareId: input.shareId,
          isShared: true
        }
      });

      if (!quiz) throw new TRPCError({ code: 'NOT_FOUND' });

      // Evaluate quiz using existing utility
      const evaluation = evaluateQuiz(quiz.questions as any, input.answers);

      // Save response
      const response = await db.quizResponse.create({
        data: {
          quizId: quiz.id,
          answers: input.answers,
          score: evaluation.scorePercentage,
          grade: evaluation.grade,
          remarks: evaluation.remarks,
          respondentName: input.respondentName,
          respondentEmail: input.respondentEmail
        }
      });

      return {
        score: evaluation.scorePercentage,
        grade: evaluation.grade,
        remarks: evaluation.remarks
      };
    })
});

```

3. Create a new page for shared quizzes.

// app/shared-quiz/[shareId].tsx

```
// trpc/index.ts
export const appRouter = router({
  // ... existing routes

  shareQuiz: privateProcedure
    .input(z.object({
      quizId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const shareId = cuid(); // Generate unique sharing ID
      
      const quiz = await db.quiz.update({
        where: {
          id: input.quizId,
          userId: ctx.userId
        },
        data: {
          shareId,
          isShared: true
        }
      });

      return {
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/shared-quiz/${shareId}`
      };
    }),

  getSharedQuiz: publicProcedure
    .input(z.object({
      shareId: z.string()
    }))
    .query(async ({ input }) => {
      const quiz = await db.quiz.findFirst({
        where: {
          shareId: input.shareId,
          isShared: true
        },
        select: {
          id: true,
          title: true,
          questions: true,
          createdAt: true
        }
      });

      if (!quiz) throw new TRPCError({ code: 'NOT_FOUND' });
      return quiz;
    }),

  submitSharedQuizResponse: publicProcedure
    .input(z.object({
      shareId: z.string(),
      answers: z.array(z.number()),
      respondentName: z.string().optional(),
      respondentEmail: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const quiz = await db.quiz.findFirst({
        where: {
          shareId: input.shareId,
          isShared: true
        }
      });

      if (!quiz) throw new TRPCError({ code: 'NOT_FOUND' });

      // Evaluate quiz using existing utility
      const evaluation = evaluateQuiz(quiz.questions as any, input.answers);

      // Save response
      const response = await db.quizResponse.create({
        data: {
          quizId: quiz.id,
          answers: input.answers,
          score: evaluation.scorePercentage,
          grade: evaluation.grade,
          remarks: evaluation.remarks,
          respondentName: input.respondentName,
          respondentEmail: input.respondentEmail
        }
      });

      return {
        score: evaluation.scorePercentage,
        grade: evaluation.grade,
        remarks: evaluation.remarks
      };
    })
});

```

4. Add sharing button to QuizView component.

```
// trpc/index.ts
export const appRouter = router({
  // ... existing routes

  shareQuiz: privateProcedure
    .input(z.object({
      quizId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const shareId = cuid(); // Generate unique sharing ID
      
      const quiz = await db.quiz.update({
        where: {
          id: input.quizId,
          userId: ctx.userId
        },
        data: {
          shareId,
          isShared: true
        }
      });

      return {
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/shared-quiz/${shareId}`
      };
    }),

  getSharedQuiz: publicProcedure
    .input(z.object({
      shareId: z.string()
    }))
    .query(async ({ input }) => {
      const quiz = await db.quiz.findFirst({
        where: {
          shareId: input.shareId,
          isShared: true
        },
        select: {
          id: true,
          title: true,
          questions: true,
          createdAt: true
        }
      });

      if (!quiz) throw new TRPCError({ code: 'NOT_FOUND' });
      return quiz;
    }),

  submitSharedQuizResponse: publicProcedure
    .input(z.object({
      shareId: z.string(),
      answers: z.array(z.number()),
      respondentName: z.string().optional(),
      respondentEmail: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const quiz = await db.quiz.findFirst({
        where: {
          shareId: input.shareId,
          isShared: true
        }
      });

      if (!quiz) throw new TRPCError({ code: 'NOT_FOUND' });

      // Evaluate quiz using existing utility
      const evaluation = evaluateQuiz(quiz.questions as any, input.answers);

      // Save response
      const response = await db.quizResponse.create({
        data: {
          quizId: quiz.id,
          answers: input.answers,
          score: evaluation.scorePercentage,
          grade: evaluation.grade,
          remarks: evaluation.remarks,
          respondentName: input.respondentName,
          respondentEmail: input.respondentEmail
        }
      });

      return {
        score: evaluation.scorePercentage,
        grade: evaluation.grade,
        remarks: evaluation.remarks
      };
    })
});

```

Add this inside the quiz card:

```

<Button
  onClick={() => {
    shareQuiz({ quizId: currentQuiz.id });
    toast({
      title: "Quiz Shared",
      description: "Share link copied to clipboard!",
      variant: "default",
    });
  }}
  className="ml-2"
>
  Share Quiz
</Button>

```

5. Add necessary UI components for viewing quiz responses:

```

// components/QuizResponses.tsx
export function QuizResponses({ quizId }: { quizId: string }) {
  const { data: responses, isLoading } = trpc.getQuizResponses.useQuery({ quizId });

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Responses</h3>
      {responses?.map((response) => (
        <Card key={response.id} className="p-4">
          <div className="flex justify-between">
            <div>
              <p className="font-medium">{response.respondentName || 'Anonymous'}</p>
              <p className="text-sm text-gray-500">{response.respondentEmail}</p>
            </div>
            <div>
              <p className="font-bold">Score: {response.score}%</p>
              <p className="text-sm">Grade: {response.grade}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

```

```
This implementation provides:
Unique sharing URLs for quizzes
Public access to shared quizzes
Collection of quiz responses with optional respondent information
Evaluation of shared quiz attempts
View of quiz responses for quiz creators

```

```
To use this functionality:
Users can share their quizzes via the share button
Recipients can access the quiz through the shared link
Responses are collected and stored
Quiz creators can view all responses
```

```
Remember to:
Add appropriate access controls
Implement rate limiting for shared quiz submissions
Add validation for respondent information
Consider adding expiration dates for shared quizzes
Add analytics for shared quiz usage
```
