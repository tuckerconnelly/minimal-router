const http = require('http');

const axios = require('axios');
const testListen = require('test-listen');

const minimalRouter = require('../index');

const server = () =>
  http.createServer(
    minimalRouter(`${__dirname}/routes`)((req, res) => {
      res.statusCode = 404;
      res.end('Not Found');
    })
  );

it('routes properly', async () => {
  const url = await testListen(server());
  const res = await axios.post(`${url}/test`);
  expect(res.data).toBe('OK');
});

it('routes properly with default pathname and methods', async () => {
  const url = await testListen(server());
  const res = await axios.post(`${url}/test-defaults`);
  expect(res.data).toBe('OK');
});
