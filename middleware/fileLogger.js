// Logfile
const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "..", "logs", "server.log");

fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

const MAX_BODY_LENGTH = 1000;
// This function limits the resposne body to mot overload the logging file
function formatBody(body) {
  if (!body) return "EMPTY";

  let content =
    typeof body === "string" ? body : JSON.stringify(body);

  if (content.length > MAX_BODY_LENGTH) {
    return content.slice(0, MAX_BODY_LENGTH) + "...(truncated)";
  }

  return content;
}
// This function loggs the log entry in the log file with , Route,status, duration of response, Req body and resposne body
function fileLogger(req, res, next) {
  const start = Date.now();

  const requestBody = formatBody(req.body);

  let responseBody = "EMPTY";
  const originalSend = res.send;

  res.send = function (body) {
    responseBody = formatBody(body);
    return originalSend.call(this, body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;

    const logEntry = `
[${new Date().toISOString()}]
${req.method} ${req.originalUrl}
Status: ${res.statusCode}
Request body: ${requestBody}
Response body: ${responseBody}
Duration: ${duration}ms
----------------------------------------
`;

    fs.appendFile(logFilePath, logEntry, err => {
      if (err) {
        console.error("Failed to write log:", err);
      }
    });
  });

  next();
};

module.exports = fileLogger;