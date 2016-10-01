# whitelist-params
Middleware handler to parse and validate request parameters

Creates a sanitized collection of request parameters on the request object, based on a whitelist

## API

```js
var wl = require('whitelist-params')
```
 
The wl object exposes a chainable function for whitelisting optional and mandatory request parameters

### Basic whitelisting

```js
// Unsafe - passes query string parameters straight to the database
router.get('/api', function (req, res, next) {
  db.find(req.query)
    .then(res.send.bind.res)
    .catch(next)
})
```

```js
// Safe - only the _name_ parameter makes it to the query
router.get('/api', wl('name'), function (req, res, next) {
    db.find(req.wl) // equivalent to db.find({ name: req.query.name })
    .then(res.send.bind.res)
    .catch(next)
});
```

### Required parameters

```js
// Returns a 400 if the name parameter is not present
router.get('/api', wl.required('name'), function (req, res, next) {
```

### Chaining required and optional parameters

```js
// Returns a 400 if the name parameter is not present, but accepts requests
// with or without the age parameter
router.get('/api', wl('age').required('name'), function (req, res, next) {
```

### Multiple arguments

Any number of arguments can be specified
```js
// Accepts any of the listed parameters
router.get('/api', wl('name', 'age', 'height', 'eyeColor'), function (req, res, next) {
```

## Methods

The only two methods are _optional_ and _required_ although they are exposed as both static and instance methods, with
the _optional_ method also serving as the default constructor

```js
wl('foo') === wl.optional('foo') === wl().optional('foo')
// and
wl.required('foo') === wl().required('foo')
```

## Data sanitization

The whitelister also checks for potentially mongo-unsafe queries, effectively barring any values at any depth which
might be evaluated as a mongo expression

```
GET /api?name[$regex]=.*
// evaluates as
{ name: { $regex: '.*' } }
```

Any value which begins with a $ will cause a 400 response to be sent. This is evaluated recursively, meaning that we
also protect against potentially unsafe values nested inside arrays or deep on the request object.

