const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const LOG_LEVEL = LEVELS[(process.env.LOG_LEVEL || 'DEBUG').toUpperCase()] || 0;

const COLORS = {
  DEBUG: '\x1b[36m',  // cyan
  INFO: '\x1b[32m',   // green
  WARN: '\x1b[33m',   // yellow
  ERROR: '\x1b[31m',  // red
  RESET: '\x1b[0m',
  DIM: '\x1b[2m',
  BOLD: '\x1b[1m',
};

function timestamp() {
  return new Date().toISOString();
}

function format(level, tag, message, meta) {
  const color = COLORS[level];
  const ts = `${COLORS.DIM}${timestamp()}${COLORS.RESET}`;
  const lvl = `${color}${COLORS.BOLD}[${level}]${COLORS.RESET}`;
  const t = tag ? `${color}[${tag}]${COLORS.RESET}` : '';
  const metaStr = meta ? ` ${COLORS.DIM}${JSON.stringify(meta)}${COLORS.RESET}` : '';
  return `${ts} ${lvl} ${t} ${message}${metaStr}`;
}

function log(level, tag, message, meta) {
  if (LEVELS[level] < LOG_LEVEL) return;
  const line = format(level, tag, message, meta);
  if (level === 'ERROR') console.error(line);
  else if (level === 'WARN') console.warn(line);
  else console.log(line);
}

module.exports = {
  debug: (tag, msg, meta) => log('DEBUG', tag, msg, meta),
  info: (tag, msg, meta) => log('INFO', tag, msg, meta),
  warn: (tag, msg, meta) => log('WARN', tag, msg, meta),
  error: (tag, msg, meta) => log('ERROR', tag, msg, meta),
};
