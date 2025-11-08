require('dotenv').config();
const { connectDatabase } = require('./config/database');
const { app } = require('./app');

const PORT = process.env.PORT || 5000;

connectDatabase(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to database', error);
    process.exit(1);
  });

module.exports = app;
