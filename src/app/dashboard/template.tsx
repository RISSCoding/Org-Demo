/** Template (bukan layout) agar animasi masuk dan kerangka loading muncul di setiap perpindahan halaman. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="ux-enter">{children}</div>;
}
