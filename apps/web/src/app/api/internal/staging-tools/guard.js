// Utility to hard-block staging tool usage in production environments
export function requireStagingEnvironment() {
    const isDev = process.env.NODE_ENV === 'development';
    const isStaging = process.env.STAGING === 'true';
    const isPreview = process.env.VERCEL_ENV === 'preview';

    if (!isDev && !isStaging && !isPreview) {
        throw new Error("FATAL: Staging-tools are strictly prohibited in the live Production environment.");
    }

    return true;
}
