/** @type {OFABot.CommandContext} */
let context = {
  bot: null,
  logger: null,
  mcData: null,
  userId: null,
};

/**
 * @param {any} bot
 * @param {string} userId
 * @param {OFABot.Logger} logger
 */
function initContext(bot, userId, logger) {
  context = {
    bot,
    logger,
    mcData: bot ? require("minecraft-data")(bot.version) : null,
    userId,
  };
}

/** @returns {OFABot.CommandContext} */
function getContext() {
  return context;
}

module.exports = { initContext, getContext };
