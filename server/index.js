const express = require('express');
const tablerouter = require('./routes/table.routes');
const cors = require('cors');

const PORT = 5000;
const app = express();

app.use(
    cors({
        origin: true,
        credentials: true,
    }),
);
app.use(express.json());

app.use('/api', tablerouter);

app.listen(PORT, () => {
    console.log('start server');
});
