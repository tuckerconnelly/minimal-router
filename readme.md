***Early Version***

# minimal-router

Minimal Node.js router.

## Usage

```
npm i @tuckerconnelly/minimal-router
```

Then where you define your HTTP server:

```js
const http = require('http');

const minimalRouter = require('@tuckerconnelly/minimal-router');

http.createServer(
  minimalRouter(`${__dirname}/routes`)((req, res) => {
    res.statusCode = 404;
    res.end('Not Found');
  })
).listen(3000);
```

Then in `routes/test-endpoint.js` add:

```js
// Optional, defaults to pathname of this file
exports.pathname = '/test-endpoint'
// Optional, defaults to ['post']
exports.methods = ['get']
// Required
exports.route = (req, res) => res.end('OK');
```

Then you can make calls to that route function:

```
> curl localhost:3000/test-endpoint

OK
```

Any file in the passed folder with those exports will get picked up and routed to.

---

> Whatever you do, work at it with all your heart, as working for the Lord, not for human masters, since you know that you will receive an inheritance from the Lord as a reward.

*Colossians 3:23*
