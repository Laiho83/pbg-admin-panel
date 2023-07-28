const parse = require("pg-connection-string").parse;
const config = parse(process.env);
module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      database: env.DATABASE,
      user: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    debug: false,
  },
});
