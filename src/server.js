import app from './app.js';
import { connectDB } from './config/db.js';

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = app.listen(port, () => console.log(`EventForge API running on port ${port}`));
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Set PORT to another value or stop the existing process.`);
      } else {
        console.error('Failed to start server:', error.message);
      }
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
