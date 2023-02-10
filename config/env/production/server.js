// Path: ./config/env/production/server.js`

module.exports = ({ env }) => ({
    url: env('MY_HEROKU_URL'),
    host: env('HOST'),
    port: env.int('PORT'),
    url: env('BACKEND_URL'),
  });
  