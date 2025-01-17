import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      keyframes: {
        rotateCW: {
          from: {
            transform: 'translate3d(0px, -50%, -1px) rotate(-45deg)'
          },
          to: {
            transform: 'translate3d(0px, -50%, 0px) rotate(-315deg)'
          }
        },
        rotateCCW: {
          from: {
            transform: 'rotate(45deg)'
          },
          to: {
            transform: 'rotate(315deg)'
          }
        },
        scroll: {
          '0%': {
            transform: 'translateX(0)'
          },
          '100%': {
            transform: 'translateX(calc(-250px *7))'
          }
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        glow: {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '0.8' }
        },
        'border-glow': {
          '0%': { borderColor: 'rgba(110, 58, 255, 0.1)' },
          '100%': { borderColor: 'rgba(110, 58, 255, 0.3)' }
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        dark: {
          bg: '#0A0B14',
          card: '#151725',
          border: '#2A2B3C',
          primary: '#6E3AFF',
          secondary: '#2563EB',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      animation: {
        'scroll': 'scroll 60s linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        rotateCW: 'rotateCW 40s var(--easing) infinite',
        rotateCCW: 'rotateCCW 40s var(--easing) infinite',
        pulseGlow: 'pulseGlow 5s linear infinite alternate',
        shimmer: 'shimmer 2s linear infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        'border-glow': 'border-glow 2s ease-in-out infinite alternate',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'dark-radial': 'radial-gradient(circle at top right, #6E3AFF 0%, transparent 70%)',
        'glow-conic': 'conic-gradient(from 180deg at 50% 50%, #6E3AFF 0deg, #2563EB 180deg, #6E3AFF 360deg)'
      },
      animationDelay: {
        '0': '0ms',
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add plugin for animation delays
    function({ addUtilities, theme }: { addUtilities: any, theme: any }) {
      const animationDelays = theme('animationDelay', {})
      const utilities = Object.entries(animationDelays).map(([key, value]) => ({
        [`.animation-delay-${key}`]: { animationDelay: value },
      }))
      addUtilities(utilities)
    }
  ],
} satisfies Config

export default config