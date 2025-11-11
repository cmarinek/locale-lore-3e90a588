import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow, var(--primary)))'
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				'logo-blue': 'hsl(var(--logo-blue))',
				'logo-blue-light': 'hsl(var(--logo-blue-light))',
				'logo-green': 'hsl(var(--logo-green))',
				'logo-green-light': 'hsl(var(--logo-green-light))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'ios': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
				'ios-lg': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.07)',
				'ios-xl': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
				'ios-inner': 'inset 0 1px 3px rgba(0, 0, 0, 0.12)',
			},
			blur: {
				'ios': '20px',
			},
			backdropBlur: {
				'ios': '20px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'shimmer': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'expand-width': {
					'0%': {
						width: '0%'
					},
					'100%': {
						width: '100%'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1'
					},
					'100%': {
						opacity: '0'
					}
				},
				'twinkle': {
					'0%, 100%': {
						opacity: '0.2',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1.5)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px) translateX(0px)'
					},
					'25%': {
						transform: 'translateY(-10px) translateX(5px)'
					},
					'50%': {
						transform: 'translateY(-5px) translateX(-5px)'
					},
					'75%': {
						transform: 'translateY(-15px) translateX(3px)'
					}
				},
				'float-slow': {
					'0%, 100%': {
						transform: 'translateY(0px) translateX(0px) rotate(0deg)'
					},
					'33%': {
						transform: 'translateY(-20px) translateX(-10px) rotate(5deg)'
					},
					'66%': {
						transform: 'translateY(-10px) translateX(10px) rotate(-5deg)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'shimmer': 'shimmer 2s infinite',
				'fade-in': 'fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
				'slide-up': 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
				'expand-width': 'expand-width 1s cubic-bezier(0.16, 1, 0.3, 1)',
				'fade-out': 'fade-out 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
				'twinkle': 'twinkle 3s ease-in-out infinite',
				'twinkle-slow': 'twinkle 5s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'float-slow': 'float-slow 8s ease-in-out infinite',
			},
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
			},
			scale: {
				'98': '0.98',
			},
			screens: {
				'xs': '475px',
			},
			transitionTimingFunction: {
				'ios': 'cubic-bezier(0.16, 1, 0.3, 1)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
