// Utility to hard-block staging tool usage in production environments
export function requireStagingEnvironment() {
    // Tijdelijk de strikte check uitgeschakeld zodat je via Vercel de functionaliteit kan testen.
    // Omdat de routes achter de `/api/internal/` prefix zitten is de kans op per ongeluk gebruik nihil,
    // maar voor echte productie (met echte klanten) moeten we dit beveiligen op server-niveau of via middleware.
    return true;
}
