/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      // 1. กวาดสีมาตรฐาน (เหมือนเดิม)
      pattern: /^(border|ring|shadow|bg|text)-(indigo|gray|rose|emerald|slate|green|blue|yellow|orange|red|purple|pink|cyan|teal|lime|amber|fuchsia|violet)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    {
      // 2. กวาดความหนา (เหมือนเดิม)
      pattern: /^(border|ring)-(0|2|4|8)$/,
    },
    {
      // 🚨 3. [ปรับใหม่] ปลดล็อก Arbitrary Values ([...]) ให้ครอบคลุมขึ้น
      // เพิ่มความสามารถในการอ่านตัวเลข, เครื่องหมาย _, และ rgba
      pattern: /^(shadow|bg|border|ring|outline)-\[[\w\d\s\(\),_\-\.\/]+\]$/,
    },

    'shadow-emergency-red', 
    'shadow-neon-pink',
    
    { pattern: /^shadow-\[.+\]$/ },
    { pattern: /^bg-\[.+\]$/ },
    { pattern: /^border-\[.+\]$/ },

    // 4. แอนิเมชันทั้งหมด (ห้ามลบ)
    'animate-border-spin', 'animate-neon-pulse', 'animate-pulse', 'animate-bounce-slow', 
    'animate-float', 'animate-soft-glow', 'animate-emergency', 'animate-wiggle', 'animate-ping-slow',
    'animate-shimmer', 'animate-border-wave', 'animate-hit-pulse',
    'bg-gradient-to-r', 'bg-gradient-to-tr', 'bg-gradient-to-br', 'bg-gradient-to-l',
    'from-pink-500', 'via-purple-500', 'to-indigo-500',
    'from-yellow-400', 'to-orange-500', 'from-cyan-400', 'to-blue-500',
    'from-green-400', 'to-emerald-600', 'from-red-500', 'to-rose-700',
    'border-transparent', 'ring-transparent', 'backdrop-blur-md', 'backdrop-blur-sm'
  ],
  theme: {
    extend: {

      boxShadow: {
      'emergency-red': '0 0 20px rgba(255, 0, 0, 0.8)',
      'neon-pink': '0 0 15px rgba(240, 171, 252, 0.7)',
    },

      fontFamily: {
        'sans': ['Kanit', 'sans-serif'],
        'kanit': ['Kanit', 'sans-serif'],
      },
      keyframes: {
        // --- Keyframes ทั้งหมดของพี่ ---
        'border-spin': { '100%': { transform: 'rotate(360deg)' } },
        'neon-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px #f0abfc, 0 0 20px #f0abfc' },
          '50%': { boxShadow: '0 0 25px #f0abfc, 0 0 50px #f0abfc' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'soft-glow': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'emergency': {
          '0%, 100%': { borderColor: 'transparent', boxShadow: 'none' },
          '50%': { borderColor: 'red', boxShadow: '0 0 20px red' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'border-wave': {
          '0%, 100%': { borderRadius: '2.5rem', transform: 'scale(1)' },
          '50%': { borderRadius: '35%', transform: 'scale(1.05)' },
        },
        'hit-pulse': {
          '0%': { outline: '0px solid rgba(255, 255, 255, 0.8)', outlineOffset: '0px' },
          '100%': { outline: '12px solid rgba(255, 255, 255, 0)', outlineOffset: '15px' },
        }
      },
      animation: {
        // --- Animation ทั้งหมดของพี่ ---
        'border-spin': 'border-spin 3s linear infinite',
        'neon-pulse': 'neon-pulse 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'soft-glow': 'soft-glow 4s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'emergency': 'emergency 0.5s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'border-wave': 'border-wave 4s ease-in-out infinite',
        'hit-pulse': 'hit-pulse 2s infinite cubic-bezier(0, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}