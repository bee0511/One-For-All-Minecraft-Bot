let context = {
  bot: null,
  logger: null,
  mcData: null,
  userId: null,
};

function initContext(bot, userId, logger) {
  context = {
    bot,
    logger,
    mcData: bot ? require("minecraft-data")(bot.version) : null,
    userId,
  };
}

function getContext() {
  return context;
}

module.exports = { initContext, getContext };
