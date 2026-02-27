export function MarketingFooter() {
    return (
        <footer className="m-footer">
            <div className="m-footer-grid">
                <div className="m-footer-col">
                    <h4>Product</h4>
                    <ul>
                        <li><a href="/functies">Functies</a></li>
                        <li><a href="/prijzen">Prijzen</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </div>

                <div className="m-footer-col">
                    <h4>Platform</h4>
                    <ul>
                        <li><a href="/account/signin">Inloggen</a></li>
                        <li><a href="/account/signup">Start 14 dagen gratis</a></li>
                    </ul>
                </div>

                <div className="m-footer-col">
                    <h4>Contact</h4>
                    <ul>
                        <li><a href="mailto:info@dutygrid.nl">info@dutygrid.nl</a></li>
                    </ul>
                </div>
            </div>

            <div className="m-footer-bottom">
                <div className="m-footer-bottom-left">
                    <p>© {new Date().getFullYear()} DutyGrid</p>
                    <div className="m-footer-legal-links">
                        <a href="/privacy">Privacybeleid</a>
                        <a href="/voorwaarden">Algemene voorwaarden</a>
                    </div>
                </div>
                <p>Made in the Netherlands 🇳🇱</p>
            </div>
        </footer>
    );
}
