// Dulu membungkus seluruh aplikasi dengan animasi blur+geser. Itu ikut menganimasikan sidebar dan header
// di setiap pindah halaman, dan `filter` membuat elemen fixed/sticky di dalamnya salah posisi.
// Animasi masuk halaman kini hanya untuk area konten (kelas .app-page di styles/site.css).
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
