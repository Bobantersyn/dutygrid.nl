import "@/components/Marketing/marketing.css";
import { MarketingNavbar } from "@/components/Marketing/MarketingNavbar";
import { MarketingFooter } from "@/components/Marketing/MarketingFooter";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="marketing-page">
            <MarketingNavbar />
            <main>{children}</main>
            <MarketingFooter />
        </div>
    );
}
