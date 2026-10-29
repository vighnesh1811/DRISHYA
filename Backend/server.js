import app from './app.js';
import { checkDatabaseConnection } from './config/database.js';
import 'dotenv/config';

const port = Number(process.env.PORT || 5000);

app.listen(port, async () => {
  try {
    await checkDatabaseConnection();
    console.log(`DRISHYA API listening on port ${port}; database connected`);
  } catch (error) {
    console.error('DRISHYA API started, but database connection failed:', error.message);
  }
});
