import { Providers } from "./providers";

export const metadata = {
  title: "Beveiligingsplanning",
  description: "Planning systeem voor beveiligingspersoneel",
};

export default function RootLayout({ children }) {
  return <Providers>{children}</Providers>;
}
