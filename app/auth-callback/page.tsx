import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AuthCallbackClient from '@/components/AuthCallbackClient';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthCallbackClient />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className='relative min-h-[60vh] w-full'>
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6E3AFF]/5 to-transparent pointer-events-none" />

      <div className='w-full mt-24 flex justify-center relative'>
        <div className='flex flex-col items-center gap-4 p-8 rounded-xl bg-[#151725]/50 border border-[#2A2B3C] backdrop-blur-sm'>
          {/* Loader with glow effect */}
          <div className='relative'>
            <div className='absolute inset-0 bg-[#6E3AFF]/20 blur-xl animate-pulse' />
            <Loader2 className='h-8 w-8 animate-spin text-[#6E3AFF] relative' />
          </div>

          {/* Text content with animation */}
          <div className='text-center space-y-2 animate-fade-in-up'>
            <h3 className='font-semibold text-xl text-white'>
              Setting up your account...
            </h3>
            <p className='text-gray-400'>
              You will be redirected automatically
            </p>
          </div>

          {/* Progress dots animation */}
          <div className='flex gap-2 mt-2'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='h-2 w-2 rounded-full bg-[#6E3AFF]/40'
                style={{
                  animation: 'glow 1s ease-in-out infinite',
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div 
        className="absolute inset-0 bg-dark-radial opacity-10 pointer-events-none" 
        style={{ 
          maskImage: 'radial-gradient(circle at center, black, transparent)'
        }} 
      />
    </div>
  );
}

// Ensure this page is always rendered at request time
export const dynamic = 'force-dynamic';