import { Archivo, Source_Serif_4 } from "next/font/google";

// Archivo punya sumbu lebar (wdth): dipakai melebar untuk judul, normal untuk antarmuka.
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// Serif untuk bacaan panjang (Tentang, Berita, deskripsi kegiatan).
export const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif-site",
  display: "swap",
});
