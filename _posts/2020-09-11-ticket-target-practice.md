---
title: Ticket Target Practice
subtitle: Working draft
category: writing
hidden: true
---
In our second tutorial for the HubSpot Carnival, we're going to make a simple target shooting game that tracks your score and saves your name and high score – with the help of HubSpot's Serverless Functions. At the end of this tutorial, you'll have a game deployed on HubSpot with persistent scores backed by the Ticket and Pipeline APIs.

# Prerequisites

* HubSpot CLI, v2.0+
* The game assets, downloadable here // TODO

# How it works

There are three pieces we'll be working on:

* The frontend Phaser.js game.
* The `start_game` serverless function, which configures the game.
* The `update_game` serverless function, which keeps track of scores and saves your high score when it's game over.

When you start the game, we get the configuration for the targets as well as some other important info from the `start_game` function. Then, every time you hit a target, we'll track that in the frontend game, and then communicate your totals to `update_game` to get a new level configuration, as well as to save that level's score using a ticket. Finally, we post `game_over` to the same endpoint to save the high score.

# The game

## Initial setup
First, head to the root folder where you had your CLI setup from the last tutorial. We'll make a new `ticket-target-practice` folder in there, then do all our work inside it.

First, we'll create the folder, and download and unzip our assets there, before uploading them.

```
mkdir ticket-target-practice
cd ticket-target-practice
open .
```


```
hs create module game
? What should the module label be? Ticket Target Practice
? What types of content will this module be used in? Page
? Is this a global module? No
Creating ~/Developer/hubspot/ticket-target-practice/game.module
Creating module at ~/Developer/hubspot/ticket-target-practice/game.module
```
Then we'll make a template:
```
hs create template ticket-target-practice
hs watch . target-practice-tutorial --initial-upload
```

Now we've got a module called `game.module`, which is also a folder that contains all our module files. We've also created a template called `ticket-target-practice`, which we'll use to create nice page where we can see our work. Finally, with `hs watch` we're also getting the CLI to watch everything that happens in this folder and upload our changes as we make them, so that it'll all automatically show up.

### Setting up the template
With our initial module and template set up, we're going to head to the Design Manager to get the Template up and running. First, find your `target-practice-tutorial` folder in the Design Manager:

![](/assets/images/sidebar.png)

{% raw %}
Now, we'll open up the `game` module in there, and scroll down on the right sidebar until we can copy the "Usage snippet.""
{% endraw %}

![](/assets/images/gamesnippet.png)

{% raw %}
Now, head to your template file back in your text editor, or open it up in the Design Manager (though the changes you make won't show up back on your computer). Replace the `{% module %}` tag in the first line of `<body>` with your own:
{% endraw %}

{% raw %}
```
<!--
    templateType: page
    label: Ticket Target Practice template
    isAvailableForNewContent: true
-->
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>{{ content.html_title }}</title>
    <meta name="description" content="{{ content.meta_description }}">
    {{ standard_header_includes }}
  </head>
  <body>
    {% module "module_YOURMODULEID" path="/ticket-target-practice/ticket-target-practice", label="ticket-target-practice" %}
    {{ standard_footer_includes }}
  </body>
</html>
```
{% endraw %}

Finally, we'll create a page based on the template, where we'll do the rest of our game and function development. In the top bar of HubSpot, go to `Marketing > Website > Website Pages`, and press `Create` in the top right corner, then select `Website page`.

Click "All of your templates".

With the search bar in the top right, let's search for "Ticket Target Practice template" and select that template. Finally, give it a name – maybe `Ticket Target Practice game`. Click `Create Page`, then we're nearly done.

But it won't let us press publish yet. You'll need to head to the Settings bar and do two things there. First, add a Page Title. Then copy the link to the page. Finally, press Publish, and open up your brand new page:

![](/assets/images/publish.gif)

This is the page and URL we'll use from now on to try the game out as we develop it. But we're also going to copy the subdomain part of the URL so that we can get the game to talk to our Serverless Functions:
```
http://yoursandboxusername-1234567.hs-sites.com
```
In this case, you'll copy `yoursandboxusername-1234567`. That's all we need to be able to call our Serverless Function from within the app.

Now, we're ready to get the game going!

# The Game
## Setting the module up

Compared to our last game, we've got some very straightforward work on the game itself. But before we start on that, we've got a couple changes to make to the other files in the module. To begin, let's head to `module.html` and make some changes there:

{% raw %}
```
<!-- module html  -->
{{ module.text }}
{{ require_js("https://cdn.jsdelivr.net/npm/phaser@3.24.1/dist/phaser.min.js", "head")}}
```
{% endraw %}

And then in `module.css`, let's import a cool Western-style font:

```
@import url('https://fonts.googleapis.com/css2?family=Rye&display=swap');

h1 {
  font-family: 'Rye', cursive;
}
```

At this point, you can refresh the game page and you should see a `"Hello, world!"` header show up.

## Uploading the assets

Before getting to work on the game itself, let's upload our `/assets` folder to make the necessary game assets available to our Phaser.js game.



## Creating the game

Open the `module.js` file. That's where our module's JavaScript lives, and where our client-side game code will live.

First, let's set up the variables and the `preload()` function, which gets called on startup.

```
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: true
      }
    },
    scene: {
        preload: preload,
        create: create,
    }
};

var playerName = "ABC"; # Insert your initials here

var level = 1;
var targetsHit = 0;

var pipeline; # for keeping track of the game's ticket pipeline that start_game will return

var movementTween;
var text;

var game = new Phaser.Game(config);

function preload ()
{
  this.load.image('target', 'https://f.hubspotusercontent20.net/hubfs/REPLACE_ME/assets/target.png');
  this.load.image('background', 'https://f.hubspotusercontent20.net/hubfs/REPLACE_ME/assets/background.png');
}
```
Pretty straightforward. Make sure you add your initials in the `playerName` variable, and replace the `REPLACE_ME` text with your account's unique ID, as you would've found in the previous tutorial.

Finally, in `preload()`, we just load a couple things. You also might have noticed that we don't have a `update()` function included in our config! We actually don't need it this time around, and can get all our work done with callbacks and events.

Now, we're going to add our `create()` function. That's where we're going to get the configuration details for our first level, by calling a serverless function. Paste the following at the end of `module.js`:

```
function create ()
{
  pointer = this.input.setDefaultCursor('url(https://f.hubspotusercontent20.net/hubfs/REPLACE_ME/assets/cursor.cur), pointer');

  var background = this.add.image(800, 600, 'background');
  background.setOrigin(1.0, 1.0);

  text = this.add.text(400, 300, "Get Ready…", { align: 'center', fontFamily: 'Rye' });
  text.setOrigin(0.5);

  // start the game with the start_game endpoint
  fetch("//yoursandboxusername-1234567.hs-sites.com/_hcms/api/start_game").then(res => {
    return res.json()
  }).then(data => {
    console.log(data);

    pipeline = data.pipeline;

    targets = this.physics.add.group();

    text.destroy();
    createTargets(1, data.config, this);
  }).catch(function(error) {
    console.log(error);
  });
}
```

First things first: replace the `REPLACE_ME` text again. Then go and grab the subdomain you saved above from your page's URL, and paste it in the `fetch` URL, replacing `yoursandboxusername-1234567`.

Now, let's walk through this code. It creates a pointer for targeting, which it loads from a URL. Then, we add a background and text to make it a little more interesting of a game. Then, we kick off a request to our `/start_game` endpoint, which is backed by a serverless function. With the results of that call, we set our `pipeline` var, and then create a group called `targets` that will contain all of our target game objects.

With the group made, we can go ahead and create the targets you'll be shooting with the `config` dictionary the call returned as well.

That brings us to `createTargets()`! Add the following code to your `module.js` file:

```
function createTargets (level, config, scene)
{
  targets.createMultiple(config); # anywhere from three to five targets, depending on what the config contains
  var speed = 10000 / level; # as the level increases, the speed does too

  targets.children.iterate(function (child) {
    // loop over each target:
    child.setInteractive();

    child.on('pointerdown', function(event) {
      child.setTint(0xff0000);

      // show the animation for a second, then disable:
      var flipDownTween = scene.tweens.add({
        targets: child,
        scaleY: 0,
        duration: 1500,
        ease: "Bounce",
        onStart: function() {
          targetsHit += 1;
          child.disableBody(false, false);
        },
        onComplete: function() {
          if (typeof child.scene != 'undefined') {
            child.disableBody(true, true);
          }

          if (targets.countActive(true) === 0) {
            // set up the new ones
            console.log("You shot them all!");

            targets.clear(true, true);
            completeLevel(false, targetsHit, level, scene);
          }
        }
      })
    });
  });

  if (movementTween) {
    scene.tweens.remove(movementTween);
  }

  movementTween = scene.tweens.add({
    targets: targets.getChildren(),
    x: '+=500',
    duration: speed,
    yoyo: true,
    repeat: 2,
    ease: 'Linear',
    onComplete: function() {
      if (targetsHit === 0) {
        // game over!
        console.log("You missed all three!");
        targets.clear(true, true);
        completeLevel(true, 0, level, scene);
      } else if (targets.countActive(true) > 0 ) {
        console.log("You missed " + targets.countActive(true) + " targets!");

        targets.clear(true, true);
        // set up new ones
        completeLevel(false, targetsHit, level, scene);
      }
    }
  });
}
```

At a high level, there are three things happening: we create the targets in bulk, using `targets.createMultiple()`. Then we configure those targets and add a tween to them that animates them down if you press on one. Finally, we create another tween – the `movementTween` – to animate all the targets from side to side, so that it's a bit harder to hit them.

If you at least one target, you can proceed to the next level. But if you miss them all, it's game over. We keep track of which targets are hit by disabling them with `child.disableBody()` in the `onStart()` block of the first tween; we also increment `targetsHit` there, to help us track the score.

Then, in the `movementTween`, we just verify how many targets were left over. If `targetsHit` is zero, that means you missed everything and we pass `gameOver=true` to `completeLevel()`. If there's still one active target, we pass the same thing we do to `completeLevel()` as in `flipDownTween.onComplete()`, because the game should continue.

There's one final piece to the frontend: the `completeLevel()` function. Here, we'll call the `/update_game` endpoint to get a new config, as well as to make sure our score is save. Let's add this function at the end.

```
function completeLevel(gameOver, hitTargets, level, scene)
{
  console.log("Ending level " + level);
  text.destroy();

  if (gameOver === true) {
    // you missed all three. Post your name and get a final score back.
    fetch("//yoursandboxusername-1234567.hs-sites.com/_hcms/api/update_game", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          game_over: gameOver,
          name: playerName,
          pipeline: pipeline
        })
    }).then(res => {
      return res.json()
    }).then(data => {
      text = scene.add.text(400, 300, data.message + "\nFinal score: " + data.score, { align: 'center', fontFamily: 'Rye' });
      text.setOrigin(0.5);
    });
  } else {
    // it's not game over yet :)
    fetch("//yoursandboxusername-1234567.hs-sites.com/_hcms/api/update_game", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          game_over: gameOver,
          level: level,
          hit_targets: hitTargets,
          pipeline: pipeline
        })
    }).then(res => {
      return res.json()
    }).then(data => {
      console.log(data);
      text = scene.add.text(400, 50, "Level " + (level + 1), { align: 'center', fontFamily: 'Rye' });
      text.setOrigin(0.5);

      // set data for the next level
      level = data.level;
      targetsHit = 0;

      createTargets(level, data.config, scene);
    });
  }
}
```

Here, we've got two branches of logic to pursue: what to POST to `update_game` if it's game over, and what to POST if the game should continue. If it's game over, we just send the player's name, as well as `game_over = true`, and the pipeline object that'll help us save the score. We'll get a final score back, as well as a message to display.

If the game should continue, we post the level we just finished, and the number of targets we hit so that a score can be tallied for the level - plus the pipeline and the `game_over` status. The endpoint will return a level and config file to begin our next level with, and once we reset `targetsHit` to 0, we can call `createTargets` and get things going again.

That's it for the client-side game! But if you refresh your page, you'll notice there's not a lot actually showing up. To finish everything off, we'll create our two serverless functions: `/start_game` and `/update_game`.

# The functions

## Initial setup
Head back to your terminal and make sure you're in the `ticket-target-practice` folder. We're going to create the two functions here, using the HubSpot CLI.
```
hs create function start-game
? Name of the folder where your function will be created start-game
? Name of the JavaScript file for your function start.js
? Select the HTTP method for the endpoint GET
? Path portion of the URL created for the function start_game
Created "/Users/konoff/Developer/hubspot/2-tickets/hubspot-components/start-game/start-game.functions"
Created "/Users/konoff/Developer/hubspot/2-tickets/hubspot-components/start-game/start-game.functions/start.js"
Created "/Users/konoff/Developer/hubspot/2-tickets/hubspot-components/start-game/start-game.functions/serverless.json"
[SUCCESS] A function for the endpoint "/_hcms/api/start_game" has been created. Upload "start-game.functions" to try it out

hs create function update-game
? Name of the folder where your function will be created update-game
? Name of the JavaScript file for your function update.js
? Select the HTTP method for the endpoint POST
? Path portion of the URL created for the function update_game
Created "/Users/konoff/Developer/hubspot/2-tickets/hubspot-components/update-game/update-game.functions"
Created "/Users/konoff/Developer/hubspot/2-tickets/hubspot-components/update-game/update-game.functions/update.js"
Created "/Users/konoff/Developer/hubspot/2-tickets/hubspot-components/update-game/update-game.functions/serverless.json"
[SUCCESS] A function for the endpoint "/_hcms/api/update_game" has been created. Upload "update-game.functions" to try it out
```

Neat! Now, in each function's `serverless.json` config file, let's add our HubSpot API key. Note: make sure you've added the API key to the CLI already, as we covered in the last tutorial.
```
{
  ...
  "secrets": ["hubapikey"],
  ...
}
```
We'll then fire up `hs watch` again:
```
hs watch . target-practice-tutorial --initial-upload
```

And now we're ready to work on our two endpoints.


## The Ticket API and Pipeline API
Here's where we get into the fun of the API. We're going to use tickets to create scores for each level, then sum them up into a score for the game. And we're going to keep track of those tickets in a custom pipeline, which allows us to create multiple stages to slot tickets into.

Normally, you'd use a pipeline for tracking the stage of a customer service ticket – for example, you'd have a pipeline with stages like "new," "triaged," and "in progress." You move your tickets between those stages, until it hits a stage where it's marked "done." And that's exactly what we're going to do here, just with two stages: Current Game Hits, and High Scores. The first is for tracking all the targets you hit on each level in your current game; if you start a new game, we'll have to remove everything in it. The second is where we sum up all the scores in Current Game Hits, then create a new ticket that'll have the high score and your initials on it.

Let's get started.

## Working on `start_game`

If it's the first time you've run the game, we're going to create a pipeline, then return it along with a config. If that pipeline's already around (which we know because pipelines have a unique label, and we can search for it), we'll return it and a config that can create the targets, but we will also delete any existing tickets in the first "Current Game Hits" stage.

```
var request = require("request");

exports.main = ({ accountId, body, params }, sendResponse) => {
  console.log('Your HubSpot account ID: %i', accountId);

  // get or create a pipeline for this game
  var pipeline;
  // first, get list of all ticket pipelines
  var options = {
    method: 'GET',
    url: 'https://api.hubapi.com/crm/v3/pipelines/tickets',
    qs: { archived: 'false', hapikey: process.env.hubapikey },
    headers: { accept: 'application/json', 'content-type': 'application/json' }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    body = JSON.parse(body);
    pipeline = body.results.find(obj => obj.label === "Ticket Target Practice Game");

    if (typeof pipeline != "undefined") {
      console.log("Pipeline ID found: " + pipeline.id);
      removeOldTickets(pipeline, sendResponse);
    } else {
      console.log("We're gonna have to create it");
      createPipeline(sendResponse);
    }
  });
};
```
It's pretty straightforward: if there's an existing pipeline called `Ticket Target Practice Game` that we find when looking through our pipelines, we're going to call `removeOldTickets()`. If not, we'll call `createPipeline()`. In both cases, we pass along `sendResponse` so that we can call that after we've done all the necessary networking.

Next, we're going to add `createPipeline()` and `removeOldTickets()`, where we communicate with the HubSpot APIs.

```


function removeOldTickets(pipeline, sendResponse)
{
  var options = {
    method: 'POST',
    url: 'https://api.hubapi.com/crm/v3/objects/tickets/search',
    qs: {hapikey: process.env.hubapikey},
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: {
      filterGroups: [
        {
          filters:
          [
            {value: pipeline.id, propertyName: 'hs_pipeline', operator: 'EQ'},
            {value: pipeline.stages[0].id, propertyName: 'hs_pipeline_stage', operator: 'EQ'}
          ]
        }
      ],
      sorts: ['id'],
      properties: ['id'],
      limit: 100,
    },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);

    var ids = [];

    body.results.forEach((item, i) => {
      ids.push({id: item.id});
    });


    var options = {
      method: 'POST',
      url: 'https://api.hubapi.com/crm/v3/objects/tickets/batch/archive',
      qs: {hapikey: process.env.hubapikey},
      headers: {accept: 'application/json', 'content-type': 'application/json'},
      body: {inputs: ids},
      json: true
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      console.log(body);

      sendFinalResponse(pipeline, sendResponse);
    });

  });
}

function createPipeline(sendResponse) {
  var options = {
    method: 'POST',
    url: 'https://api.hubapi.com/crm/v3/pipelines/tickets',
    qs: {hapikey: process.env.hubapikey},
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: {
      displayOrder: 0,
      stages: [
        {label: 'Current Game Hits', displayOrder: 0, metadata: {ticketState: 'OPEN'}},
        {label: 'High Scores', displayOrder: 1, metadata: {ticketState: 'CLOSED'}}
      ],
      label: "Ticket Target Practice Game"
    },
    json: true
  };

  pipeline = request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    sendFinalResponse(body, sendResponse);
  });
}
```
In `removeOldTickets()`, we craft a request to the `/tickets/search` endpoint that looks for tickets in our game-specific pipeline, in the first `Current Game Hits` stage, with a very optimistic `limit` of 100 items. Then, we pass those IDs to `/tickets/batch/archive` to delete them. Finally, we call `sendFinalResponse()` with the pipeline and the `sendResponse` callback.

In `createPipeline()`, we actually create the pipeline we've heard so much about. It's pretty easy: we pass in stages, with their own order and label and `ticketState`, and we give the pipeline its own unique label. With the response, we pass our brand new pipeline object to `sendFinalResponse()` as well.

Now for the final piece: the `sendFinalResponse()` function, where we make use of `sendResponse()`:
```
function sendFinalResponse(pipeline, sendResponse) {
  sendResponse({
    statusCode: 200,
    body: {
      message: 'Level 1!',
      config: {
        key: 'target',
        repeat: 2,
        setXY: { x: 40, y: 285, stepX: 100}
      },
      pipeline: pipeline
    },
  });
}
```
Here, we craft the `config` object that'll allow the game to create the targets using `targets.createMultiple()`. We also pass along the pipeline object, so that we don't have to search for it every time we want to update the game state in the future.

With that final piece, you should be able to load the game and play the first level. Your browser console should look something like this:

![](/assets/images/console1.png)

## Working on `update_game`
The `/update_game` function and endpoint is there to record the score and return the next level if the game hasn't ended, or to tally and return the high score if `game_over` is `true`. To that end, we send it a `game_over` boolean, and check that right away.

At the top of `update-game.functions/update.js`, let's add this:
```
var request = require("request");

exports.main = ({ accountId, body, params }, sendResponse) => {
  var pipeline = body.pipeline;
  var level = body.level + 1;

  if (body.game_over != true) {
    // game continues!
    var score = body.hit_targets * 100;

    var config;

    if (level < 3) {
      config = {
        key: 'target',
        repeat: 2,
        setXY: {x: 40, y: 285, stepX: 100}
      }
    } else if (level < 7) {
      config = {
        key: 'target',
        repeat: 2,
        setXY: {x: 40, y: 210, stepX: 100, stepY: 72}
      }
    } else {
      config = {
        key: 'target',
        repeat: 4,
        setXY: {x: 40, y: 135, stepX: 40, stepY: 72}
      }
    }

    console.log("score is " + score);
    createTicket(score, level, config, pipeline, sendResponse);
  } else {
    // the game is over!
    createHighScoreTicket(body.name, pipeline, sendResponse);
  }
};
```

If the game hasn't ended yet, we create a new config, then pass all the necessary response stuff along to `createTicket()`. But if it's game over, we simply call `createHighScoreTicket()`.

Let's make those `createTicket()` and `createHighScoreTicket()` functions now.
```
function createTicket(score, level, config, pipeline, sendResponse) {
  // create tickets for the level's score
  var options = {
    method: 'POST',
    url: 'https://api.hubapi.com/crm/v3/objects/tickets',
    qs: {hapikey: process.env.hubapikey},
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: {
      properties: {
        hs_pipeline: pipeline.id, hs_pipeline_stage: pipeline.stages[0].id, subject: score
      }
    },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    sendResponse({
      statusCode: 200,
      body: {
        message: 'Level ' + level,
        level: level,
        config: config,
        game_over: false
      },
    });
  });
}
```

`createTicket()` is pretty straightforward! We make a call to `/objects/tickets`, and pass along the pipeline and stage details, as well as the score for the level. In handling the response, we call `sendResponse()` and send back the new level, config, and a message too.

```
function createHighScoreTicket(name, pipeline, sendResponse)
{
  // first, search for the tickets for each level's score
  var options = {
    method: 'POST',
    url: 'https://api.hubapi.com/crm/v3/objects/tickets/search',
    qs: {hapikey: 'acac84e6-fb76-456f-9b35-668e8c77000c'},
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: {
      filterGroups: [
        {
          filters:
          [
            {value: pipeline.id, propertyName: 'hs_pipeline', operator: 'EQ'},
            {value: pipeline.stages[0].id, propertyName: 'hs_pipeline_stage', operator: 'EQ'}
          ]
        }
      ],
      sorts: ['id'],
      properties: ['id', 'subject', 'time_to_close'],
      limit: 100,
    },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);

    // sum up their scores
    var score = body.results.reduce((a,b) => a + parseInt(b.properties.subject), 0);
    console.log("High Score is: " + score);
    // create a high score ticket in the second stage of the pipeline
    var options = {
      method: 'POST',
      url: 'https://api.hubapi.com/crm/v3/objects/tickets',
      qs: {hapikey: process.env.hubapikey},
      headers: {accept: 'application/json', 'content-type': 'application/json'},
      body: {
        properties: {
          hs_pipeline: pipeline.id, hs_pipeline_stage: pipeline.stages[1].id, subject: JSON.stringify({ name: name, score: score })
        }
      },
      json: true
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      var subjectObject = JSON.parse(body.properties.subject);

      // return the score
      sendResponse({
        statusCode: 200,
        body: {
          message: 'Game Over',
          game_over: true,
          score: subjectObject.score
        }
      });
    });
  });
}
```
Here, we have to do a little more heavy lifting. First, we search for all of the tickets that tracked the scores in individual levels, which are all in the first stage of the pipeline. Then we sum them up, and create a new ticket, where we put the stringified JSON of the score and the user's name as the ticket's `subject` - which will come in handy in our next tutorial when we want to display the high scores. Finally, we send a response where we inform the user that it truly is game over, and show them their high score.

That's it! You should be able to keep playing until you miss all the targets in the level. At that point, you'll see this message:
![](/assets/images/gameover.png)

Hopefully you'll get a higher score than I did.

# Conclusion

That's all for now. We created a frontend game using Phaser.js and embedded it in a module, then published it using a template. Then, we handled the backend by creating two serverless functions to begin and update the game as we played it. The result: all the carnival game fun we could hope for.
