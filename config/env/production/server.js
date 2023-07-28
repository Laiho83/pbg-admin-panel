// Path: ./config/env/production/server.js`

module.exports = ({ env }) => ({
  url: env("AWS_URL"),
});
