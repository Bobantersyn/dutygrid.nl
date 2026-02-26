export function MarketingFooter() {
    return (
        <footer className="m-footer">
            <div className="m-footer-grid">
                <div className="m-footer-brand">
                    <img src="/logo.png" alt="DutyGrid" />
                </div>

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
                        <li><a href="/contact">Demo aanvragen</a></li>
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
                <p>© {new Date().getFullYear()} DutyGrid. Alle rechten voorbehouden.</p>
                <p>Made in the Netherlands 🇳🇱</p>
            </div>
        </footer>
    );
}
