"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/app/_trpc/client';
import { useEffect } from 'react';

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');

  const { data, error, isSuccess } = trpc.authCallback.useQuery(undefined, {
    retry: true,
    retryDelay: 500
  });

  useEffect(() => {
   // Corrected router.push logic in AuthCallbackClient
   console.log(isSuccess)
if (isSuccess) {
  console.log(data.success)
  if (data.success) {
    // Corrected template literal
    router.push(origin ? `${origin}` : '/dashboard');
  }
}
else if (error?.data?.code === 'UNAUTHORIZED') {
      router.push('/sign-in');
    }
  }, [isSuccess, data, error, origin, router]);

  return null; // This component doesn't render anything itself
}