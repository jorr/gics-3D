import path from 'path';
import express from 'express'
import favicon from 'serve-favicon';
import capture from 'capture-console';
import { doGics } from './app/gics3d.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();

app.use(express.text());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT || 6105);

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

app.post('/gics', (req, res) => {
  let logs = '';
  capture.startCapture(process.stdout, stdout => logs += stdout);
  capture.startCapture(process.stderr, stderr => logs += stderr);

  let output = doGics(req.body);

  capture.stopCapture(process.stdout);
  capture.stopCapture(process.stderr);

  res.send({
    result: output,
    logs: logs
  });
});

console.log('GICS awaiting a program on port: ', process.env.PORT || 6105);