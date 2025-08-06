const path = require('path');

module.exports = configEnv = () => {
  const filepath = path.join(__dirname, '..', '.env');
  require('dotenv').config({ path: filepath });
}