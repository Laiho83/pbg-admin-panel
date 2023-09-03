"use strict";

/**
 * Get user data
 */

const userService = require("../services/user.service.js");

module.exports = {
  async updateEmail(ctx) {
    const id = ctx.params.id;
    const email = ctx.request.body.email;

    try {
      await strapi.query("plugin::users-permissions.user").update({
        where: { id: id },
        data: {
          email: email,
        },
      });
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify({ message: "Email update success:" });
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = JSON.stringify({
        message: "Email update error: " + err,
      });
    }
  },
};
