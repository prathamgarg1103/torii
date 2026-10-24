export const metadata = { title: { default: "Partner Portal", template: "%s | Torii Partner Portal" } };
/** Everything under /partner: the portal Japanese publishers use to bring their series to Torii. */
export default function PartnerRoot({ children }: { children: React.ReactNode }) {
  return <div data-section="partner" className="partner-root">{children}</div>;
}
