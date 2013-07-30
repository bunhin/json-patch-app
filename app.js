#!/usr/bin/env node

/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */

/**
 * Module dependencies.
 */
var express = require('express'),
    app = express(),
    json_patch = require('json-patch');

/**
 * Configure Express.
 */
app.configure(function () {
  "use strict";

  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(app.router);
});

/**
 * Set GET route paths.
 */

// Add static route for CSS and images.
app.use('/assets', express.static('views/assets', { maxAge: 86400000 }));

// Display home page.
app.get('/', function (req, res) {
  "use strict";

  res.render('index');
});

// Display JSON-Patch apply page.
app.get('/apply', function (req, res) {
  "use strict";

  var json = {
      foo : "bar",
      foos : [
        "bar1",
        "bar2",
        "bar3"
      ]
    },
    jsonPatch = [
      {
        "op" : "replace",
        "path" : "/foo",
        "value" : "rabbit"
      },
      {
        "op" : "add",
        "path" : "/fizz",
        "value" : [
          "buzz"
        ]
      }
    ];

  res.render('apply', { json: JSON.stringify(json, null, 2), jsonPatch: JSON.stringify(jsonPatch, null, 2), generated: false, example: true });
});

// Display JSON-Patch diff page.
app.get('/diff', function (req, res) {
  "use strict";

  // This is a modified JSON object created from the apply example above.
  var orgJson = {
      foo : "bar",
      foos : [
        "bar1",
        "bar2",
        "bar3"
      ]
    },
    modJson = {
      foo : "rabbit",
      foos : [
        "bar1",
        "bar2",
        "bar3"
      ],
      fizz : ["buzz"]
    };

  res.render('diff', { orgJson: JSON.stringify(orgJson, null, 2), modJson: JSON.stringify(modJson, null, 2), example: true, applied: false });
});

/**
 * Set POST route paths.
 */

// Appy a JSON-Patch.
app.post('/apply', function (req, res) {
  "use strict";

  try {
    var applied = false,
      modJson = JSON.parse(req.body.json),
      orgJson = JSON.parse(req.body.json),
      jsonPatch = JSON.parse(req.body.jsonPatch);

    applied = json_patch.apply(modJson, jsonPatch);

    res.render('diff', { orgJson: JSON.stringify(orgJson, null, 2), modJson: JSON.stringify(modJson, null, 2), example: false, applied: applied });
  } catch (error) {
    res.render('diff', { orgJson: "invalid", modJson: "invalid", example: false, applied: false });
  }
});

// Generate a JSON-Patch.
app.post('/diff', function (req, res) {
  "use strict";

  try {
    var generated = false,
      jsonPatch,
      json = JSON.stringify(JSON.parse(req.body.orgJson), null, 2),
      modJson = JSON.parse(req.body.modJson),
      orgJson = JSON.parse(req.body.orgJson),
      observer = json_patch.observe(orgJson);

    observer.object = modJson;

    jsonPatch = json_patch.generate(observer);

    if (json && jsonPatch) {
      generated = true;

      res.render('apply', { json: json, jsonPatch: JSON.stringify(jsonPatch, null, 2), generated: generated, example: false });
    } else {
      res.render('apply', { json: "invalid", jsonPatch: "invalid", generated: generated, example: false });
    }
  } catch (error) {
    res.render('apply', { json: "invalid", jsonPatch: "invalid", generated: false, example: false });
  }
});

/**
 * Start the server.
 */
// Set port number to listen on.
var port = 3000;

console.log('JSON-Patch Apply / Generate Diff App started on port ' + port + ".");
console.log("You can now access it in your browser on this server's IP/hostname/localhost.");
console.log("Example:");
console.log("http://192.168.0.1:" + port);
console.log("http://app.example.com:" + port);
console.log("http://localhost:" + port);


// Start the server on this port.
app.listen(port);
