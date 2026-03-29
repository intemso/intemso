// Wrapper to load the Next.js standalone server
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
process.env.PORT = process.env.PORT || '3000';
require('./.next/standalone/apps/web/server.js');
