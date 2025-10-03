// backend/utils/logger.js
// Lightweight structured logger. Could be swapped for pino/winston later.
const levels = ['debug', 'info', 'warn', 'error'];

function format(level, msg, meta) {
  const ts = new Date().toISOString();
  const base = { ts, level, msg };
  const payload = meta ? { ...base, ...meta } : base;
  return JSON.stringify(payload);
}

const logger = {
  debug: (msg, meta) => console.debug(format('debug', msg, meta)),
  info: (msg, meta) => console.log(format('info', msg, meta)),
  warn: (msg, meta) => console.warn(format('warn', msg, meta)),
  error: (msg, meta) => console.error(format('error', msg, meta)),
  child: (context = {}) => {
    const childLogger = {};
    levels.forEach(lvl => {
      childLogger[lvl] = (msg, meta) => logger[lvl](msg, { ...context, ...meta });
    });
    return childLogger;
  }
};

export default logger;