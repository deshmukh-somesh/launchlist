# tRPC Setup with Kinde Authentication

This documentation explains how to set up tRPC with Kinde authentication in a Next.js application. The setup provides both public and private procedures, with authentication middleware for protected routes.

## Prerequisites

- Next.js project
- Kinde authentication package installed (`@kinde-oss/kinde-auth-nextjs`)
- tRPC packages installed (`@trpc/server`, `@trpc/client`)

## Core Components

### 1. tRPC Instance Initialization
```typescript
const t = initTRPC.create();
```
This creates a new tRPC instance with default configurations.

### 2. Authentication Middleware

The middleware checks if a user is authenticated using Kinde:

```typescript
const isAuth = middleware(async(opts) => {
    const { getUser } = getKindeServerSession()
    const user = await getUser();

    if(!user || !user.id) {
        throw new TRPCError({code: 'UNAUTHORIZED'})
    }

    return opts.next({
        ctx: {
            userId: user.id,
            user,
        }
    })
})
```

Key features:
- Uses `getKindeServerSession()` to access the current user session
- Throws an `UNAUTHORIZED` error if no user is found
- Passes user information to the context if authentication succeeds

### 3. Exported Procedures

```typescript
export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);
```

These exports provide:
- `router`: Base router for defining API routes
- `publicProcedure`: Endpoints that don't require authentication
- `privateProcedure`: Protected endpoints that require authentication

## Usage Examples

### Creating a Router

```typescript
import { router, publicProcedure, privateProcedure } from './trpc';

export const appRouter = router({
    // Public route - no auth required
    publicRoute: publicProcedure
        .query(() => {
            return "This is public"
        }),

    // Protected route - requires authentication
    protectedRoute: privateProcedure
        .query(({ ctx }) => {
            return `Hello ${ctx.user.name}!`
        })
});
```

### Accessing User Data

In protected routes, you can access user data through the context:

```typescript
privateProcedure.mutation(({ ctx }) => {
    const userId = ctx.userId;
    const user = ctx.user;
    // Use user data here
});
```

## Error Handling

The middleware automatically handles unauthorized access:
- Throws `UNAUTHORIZED` error if no user is found
- Client-side will receive proper error responses
- Can be caught and handled using tRPC's error handling

## Security Considerations

1. Always use `privateProcedure` for sensitive operations
2. Never expose sensitive user data in public procedures
3. Validate user permissions beyond just authentication when needed
4. Keep your Kinde authentication tokens secure

## Best Practices

1. Group related procedures in separate router files
2. Use meaningful procedure names
3. Add input validation using zod schemas
4. Handle errors gracefully on the client side
5. Document expected inputs and outputs for each procedure

## Troubleshooting

Common issues and solutions:
1. Unauthorized errors: Check if user is properly logged in with Kinde
2. Context undefined: Ensure middleware is properly configured
3. Session problems: Verify Kinde setup in your Next.js application

