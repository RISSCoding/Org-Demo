/** Onboarding adalah pengalaman satu-kali; beri animasi masuk agar terasa mengundang. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="ux-enter">{children}</div>;
}
