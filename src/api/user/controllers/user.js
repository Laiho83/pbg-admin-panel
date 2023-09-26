"use strict";

/**
 * Get user data
 */
const fs = require("fs");
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

  async welcomeEmail(ctx) {
    const id = ctx.params.id;
    const email = ctx.state.user.email;
    const username = ctx.state.user.username;
    const confirmationCompleted = ctx.state.user.confirmationCompleted;

    const template = fs
      .readFileSync("src/api/user/email/account-created.html")
      .toString();

    const emailTemplate = {
      subject: "PrettyBarnGood ACCOUNT CREATED",
      text: `PrettyBarnGood ACCOUNT CREATED`,
      html: template,
    };

    if (!confirmationCompleted) {
      await module.exports.updateUserConfirmation(id);

      try {
        await strapi.plugins["email"].services.email.sendTemplatedEmail(
          {
            to: email,
          },
          emailTemplate,
          {
            username: username,
          }
        );
        ctx.response.status = 200;
        ctx.response.body = JSON.stringify({
          message: "Confirmation completed",
        });
      } catch (err) {
        ctx.response.status = 400;
        ctx.response.body = JSON.stringify({
          message: "Confirmation completed Error: " + err,
        });
      }
    } else {
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify({
        message: "Confirmation already completed",
      });
    }
  },

  updateUserConfirmation: async (id) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: id },
          data: {
            confirmationCompleted: true,
          },
        })
        .then(() => {
          return true;
        });
    } catch (err) {
      return err;
    }
  },
};
