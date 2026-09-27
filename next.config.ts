import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
