#!/usr/bin/env node

const open = require('open');
const app = require('../index.js');
const port = 8999

app.listen(port, () => {
    console.log(`logcat-ui running on port ${port}`);
    open(`http://localhost:${port}`);
});