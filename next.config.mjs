/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /**
     * Panelden yüklenen ürün fotoğrafları Vercel Blob'da duruyor ve menüde
     * next/image ile basılıyor; uzak adresler açıkça izinli olmalı.
     * Store adı projeye göre değiştiği için alt alan adı joker.
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
