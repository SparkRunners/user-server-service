const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from Express! LIve NEw change testing MNow it works');
});

app.get('/docker', (req, res) => {
  res.send('Hello from auth-server-service-docker with live updating from volme!');
});

app.listen(PORT, () => {
  console.log(`Server running inside container on http://localhost:${PORT}`);
});
