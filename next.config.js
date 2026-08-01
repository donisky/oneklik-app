/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // --- TAMBAHAN UNTUK MENGATASI ERROR 413 ---
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Mengizinkan upload file hingga 50MB
    },
    responseLimit: '50mb',
  },
}

module.exports = nextConfig