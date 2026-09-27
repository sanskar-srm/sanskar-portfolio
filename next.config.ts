import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Lets a verification build run next to a live `next dev` without clobbering .next
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Genkit pulls in handlebars, which webpack can't bundle cleanly.
  serverExternalPackages: ['genkit', '@genkit-ai/googleai', 'handlebars', 'dotprompt'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@react-three/drei'],
  },
};

export default nextConfig;
