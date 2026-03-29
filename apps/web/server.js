// Wrapper to load the Next.js standalone server on Render
// Render requires HOSTNAME=0.0.0.0 and provides PORT (usually 10000)
process.env.HOSTNAME = '0.0.0.0';
process.env.PORT = process.env.PORT || '10000';
console.log(`Starting Next.js on 0.0.0.0:${process.env.PORT}`);
require('./.next/standalone/apps/web/server.js');
