const app = require('./src/app');
const connectDB = require('./src/config/database');
const { initializeCronJobs } = require('./src/utils/cronJobs');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize cron jobs
initializeCronJobs();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});