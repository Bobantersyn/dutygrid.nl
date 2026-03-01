import { redirect } from 'react-router';
import { useEffect } from 'react';

export function loader() {
    return redirect('https://dutygrid-superadmin.vercel.app');
}

export default function SuperAdminRedirect() {
    useEffect(() => {
        window.location.href = 'https://dutygrid-superadmin.vercel.app';
    }, []);

    return (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1>Loading Platform Admin...</h1>
            <p>You are being redirected to the secure admin environment.</p>
            <p><a href="https://dutygrid-superadmin.vercel.app" style={{ color: 'blue', textDecoration: 'underline' }}>Click here if you are not redirected automatically</a></p>
        </div>
    );
}
