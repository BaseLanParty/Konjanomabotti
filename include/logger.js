var Winston = require("winston");
Winston.transports.DailyRotateFile = require("winston-daily-rotate-file");
// Chat Logger
Winston.emitErrs = true;
// Command Error Logger
exports.Logger = new Winston.Logger({
  colors: {
    verbose: "orange",
    debug: "blue",
    info: "green",
    warn: "yellow",
    error: "red"
  },
  transports: [
    new Winston.transports.DailyRotateFile({
      humanReadableUnhandledException: true,
      handleExceptions: true,
      name: "file:exceptions",
      filename: __dirname + "/../logs/exceptions",
      datePattern: "-dd-MM-yyyy.log",
      level: "exception",
      json: false
    }),
    new Winston.transports.DailyRotateFile({
      handleExceptions: false,
      name: "file:error",
      filename: __dirname + "/../logs/errors",
      datePattern: "-dd-MM-yyyy.log",
      level: "error",
      json: false
    }),
    new Winston.transports.DailyRotateFile({
      handleExceptions: false,
      name: "file:console",
      filename: __dirname + "/../logs/console",
      datePattern: "-dd-MM-yyyy.log",
      level: "debug",
      json: false
    }),
    new Winston.transports.Console({
      handleExceptions: true,
      level: "verbose",
      colorize: true,
      json: false
    })
  ],
  exitOnError: true
});
