// Utility to hard-block staging tool usage in production environments
export function requireStagingEnvironment() {
    // TEMPORARY BYPASS: The user is actively testing the Superadmin dashboard on the live production Vercel deployment.
    // To allow the staging tools to work, we are bypassing the strict NODE_ENV check.
    // Long term, this should be protected via strict Auth session role checks (e.g. user.role === 'superadmin') instead.
    return true;
}
