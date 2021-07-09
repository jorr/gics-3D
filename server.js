import path from 'path';
import express from 'express'
// middleware that allows you to parse request body, json, etc.
import bodyParser from 'body-parser';
// middleware to serve a favicon prior to all other assets/routes
import favicon from 'serve-favicon';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT || 6105);

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

app.post('/gics', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
})

//Input API endpoint ADD HERE

console.log('GICS awaiting a program on port: ', process.env.PORT || 6105);