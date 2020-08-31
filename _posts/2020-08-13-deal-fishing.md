---
title: Deal Fishing Tutorial
subtitle: August 21 draft
category: writing
hidden: true
---

Welcome to the HubSpot Deal Carnival\. While you learn how to create a fun, in\-browser game using the Phaser\.js game framework using skills you’ve already got as a web developer, you’ll also get familiar with the HubSpot platform\. In fact, we’re going to use HubSpot’s APIs to make our games work, and HubSpot’s platform will even make it possible for us to deploy our frontends, securely interact with HubSpot APIs, and link our games together into a Vue\.js\-backed scoreboard\.

This is the first tutorial in a series, and it’s all about getting you started and productive \(while learning a new trick or two\)\. We’ll get you signed up and familiar with HubSpot’s platform and dev tools, then you’ll build a *Deal Fishing* minigame\. Finally, we’ll integrate the game with HubSpot’s `contacts` API by using HubSpot Serverless Functions\.
# Getting set up with HubSpot
### Sign up for HubSpot
We’re going to sign up for a HubSpot developer account\. That’ll let us have a sandbox to safely explore the APIs, and build our carnival games\.
https://app\.hubspot\.com/signup/standalone\-cms\-developer

Once you’ve got that, we’re ready to get using any HubSpot features\. We’ll be using the HubSpot CMS to deploy our games, the HubSpot CLI to develop locally and push our game to HubSpot’s cloud\-based CRM, and we’ll use HubSpot Serverless Functions to securely speak to the various APIs we’ll be using\.

## Using the HubSpot CLI
https://developers\.hubspot\.com/docs/cms/developer\-reference/local\-development\-cms\-cli
### Downloading and configuring it
To download the HubSpot CLI:

```
npm install -g @hubspot/cms-cli
```


That’ll install it globally\. If you ever need a reference on the full scope of the CLI and how it works for local development, [just check out this page](https://developers.hubspot.com/docs/cms/developer-reference/local-development-cms-cli)\.

Next, let’s initialize and authenticate in the appropriate folder\. Create a new folder – maybe call it `hubspot-local` – and move into it:

```
mkdir hubspot-local
cd hubspot-local
hs init
```


You’ll first get a prompt to press Enter to get sent to a website to generate your personal CMS access key\. Press enter\!

Select the account you created above – if it doesn’t show up by default, press the “View your other accounts” button\. **Make sure** you’re selecting the sandbox account you created above, or else you might send make a mess of your organization’s HubSpot data\.

At the next screen, be sure to select all the checkboxes under “Permissions\.” That’ll allow us to get the full local development experience, and to complete this tutorial without a hitch\. And as a security note, this CMS access key is for your HubSpot CLI – not for the game you’ll be making\.

![](/assets/images/0b861e4782d651970322015cc45c8ddd.png)

On the next screen you can copy your personal CMS access key; go back to your terminal and paste it there\. Give the account a nickname you’ll remember \(I used `carnival-account` \)\. You can now open up the `hubspot.config.yml` file in this folder, and you’ll see all the info you just entered\.

​**Bonus tip**​: if you’ve got many accounts added to your CLI already, it might be a good idea to switch the `defaultPortal` value to the nickname of the new sandbox account you added\. That way, you won’t accidentally make changes to someplace you shouldn’t\.
### Creating and pushing your first module
Now that we’re ready to use the CLI, let’s create a module\. The module is where we’ll be doing our coding, and it’s what will get deployed to HubSpot – so that we can see our game deployed and playable in the cloud, simply by navigating to a HubSpot browser\. Through modules we can also get the game to interact with Serverless Functions, which will let our simple game demo connect to the HubSpot API\.

It’s just one command:

```
hs create module deal-fishing
? What should the module label be? Deal Fishing
? What types of content will this module be used in? Page
? Is this a global module? No
Creating ~/Developer/hubspot/hubspot-carnival/deal-fishing.module
Creating module at ~/Developer/hubspot/hubspot-carnival/deal-fishing.module
```


Fun\! Let’s see what’s in there:

```
/deal-fishing.module:
> fields.json
> meta.json   
> module.css  
> module.html
> module.js
```


Modules are pretty simple\. They’re just folders that end with a `.module` name, and they have to contain these five files\.
### Sync a module to HubSpot
From the `deal-fishing.module` folder, run:

```
hs watch . deal-fishing.module
```


After `watch` , we’ve got `.` for the source folder that we’re in, and we want it to show up in the HubSpot Design Manager as `deal-fishing.module` \.

Let’s go see if it showed up\. [Sign into HubSpot with your sandbox account](https://app.hubspot.com/portal-recommend/l?slug=dash), then in the top bar, navigate from Marketing > Files and Template > Design Tools\. You’ll see a sidebar that should show your new `deal-fishing` module:

![](/assets/images/8b2f686af8ff2e3225a390159771717c.png)

Select it, and you’ll see an editor – it automatically displays the html, css and js files that we’ll be working in\. You can happily work there for the rest of this tutorial, but I’ll be writing instructions for local development, where you can use your favourite shell and text editor\.
### Live updates to your module
Before we head back to our local development, we’re going to open the preview URL from the Design Manager\.

![](/assets/images/410708906f6f78886b8a003099d7c9cd.png)

There’s nothing there yet – just a sample “rich text field” and an empty page\. But that’s where we’ll see our changes show up\.

Head back to your terminal, and open `module.html` with your favourite text editor\. Make sure that `hs watch` is still running, and edit the file to look as follows:

```
<!-- module html  -->
<div>Hello, world!</div>
```


Now save it, and you should see the changes show up immediately in your preview:

![](/assets/images/367a07c8427268d1008e3825361d9e0b.png)

Great\. Now that we’ve learned how to work locally with the HubSpot CMS, we’re ready to get working with Phaser\!
## Phaser\.js and Deal Fishing
### Phaser\.js and game development
Phaser\.js looks a *lot* like other modern JavaScript web frameworks\. The simplest Phaser\.js example looks like this:

```
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload ()
{
	// this gets called once at the very beginning when `game` is instantiated
}

function create ()
{
	// this gets called once, after `preload` is finished
	// anything loaded in `preload` is guaranteed to be accessible here
}

function update ()
{
	// the game loop calls `update` constantly
}
```


Most of the time, you create a phaser\.js game just by adding the framework via CDN \- see the `<script>` tag at the top\. That’s probably familiar to you Vue\.js developers out there\.

And there are a few differences in architecture\. Rather than managing elements in the DOM, the most fundamental piece of your game is a ​*game object*​, which the `game` instance keeps track of\. If something is part of the game world, it’s probably a game object, and you can add whatever properties you want to those objects in order to keep their state and build the game on top of them\. For instance, when your player’s health goes up or down, you would update `player.health` \. When it hits `0` , you can decide to kill the player by triggering effects, showing “game over” text, and more\.

The Phaser\.js framework can handle many things for you, including display and graphics, physics \(which includes gravity and collisions\), and more – though it’s not as simple as instantiating a game object\. We’ll learn how to wire up your game objects so they do what you want them to\.

Setup and loading of assets \(like sprites, which are images that’ll turn into your characters, or sound effects\) is handled in `preload` , and `create` is where you’ll turn those assets into actual game objects\. Those two methods are run once, at the creation of the `game` instance\.

After that, the game loop continuously calls the `update` function\. We can also respond to events emitted by animations, game objects, and more – we just have to subscribe to them and pass them a callback\. We’ll learn more about when it’s appropriate to use `update` as opposed to handling changes in an event\-driven way with callbacks\.

That’s probably enough introduction\! What better way to learn how this all works than to just get started?
# Creating the *Deal Fishing* mini game
First, download the assets we’ll be using from this link:

```
// TODO
```


Unzip those, and add them to your `hubspot-local` folder\. We’ll come back to the assets in a few steps\.

Next, copy and paste this boilerplate into the `module.js` file that was created in your `deal-fishing.module` folder:

```
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload ()
{
	// this gets called once at the very beginning when `game` is instantiated
}

function create ()
{
	// this gets called once, after `preload` is finished
	// anything loaded in `preload` is guaranteed to be accessible here
}

function update ()
{
	// the game loop calls `update` constantly
}
```


Compared to the barest example we saw above, this `config` contains one extra key: `physics` \! We’ve set gravity to zero, so there won’t be any falling\. Instead, we’ll use physics to handle overlaps and collisions between our player and the pond\.

And in your `module.html` file, we’ll add one line so that it looks like this:

{% raw %}
```
{{ require_js('https://cdn.jsdelivr.net/npm/phaser@3.24.1/dist/phaser.min.js', 'head')}}
```
{% endraw %}

So far, we’ve loaded Phaser via a CDN\. The `require_js` template tag there is part of the [HubL templating language](https://developers.hubspot.com/docs/cms/hubl)\. Using it in your code rather than `<script>` gives you some helpful automatic optimizations, like preventing you from accidentally loading the same library many times over all your modules\. And for Phaser to work, we need to have it load in the header, so we pass in the `head` parameter here to indicate to the CMS where it should load the script\.

Now, let’s look back at the live preview\. You can treat this window just like you would any tab you were using for local development\. You can open up your browser’s Developer Tools and examine the console\. Also, you can take a peek at the source of the page to see how the CRM nicely merged your `module.js` code, imported the Phaser\.js file, and got things ready\.

But right now, there’s not a lot to look at\. That’s because we haven’t yet added any assets\! So let’s try that out\.
## Getting our assets ready to use
### Loading your assets
Phaser loads everything upfront using the `preload()` function\. So open up your `module.js` file, and add the following to `preload()` :

```
function preload ()
{
	// this gets called once at the very beginning when `game` is instantiated
	this.load.image('ground', '/assets/atlas.png');
	this.load.spritesheet('pond', '/assets/pond.png', { frameWidth: 54, frameHeight: 39});
	this.load.spritesheet('tile', '/assets/tile.png', { frameWidth: 16, frameHeight: 16});

	this.load.spritesheet('fishA', '/assets/FishA.png', { frameWidth: 16, frameHeight: 16});

	this.load.spritesheet('player', '/assets/hero.png', { frameWidth: 16, frameHeight: 24});
}
```


It’s pretty straightforward code: we use the `load` instance store on the scene to load an image, and also some spritesheets, which we’ll soon add to our game and make visible\.

However, that second parameter \(like `‘/assets/atlas.png’` \) refers to local files\. For those files to show up in our Previewer, we have to upload them to HubSpot, and paste in their proper URLs\.

Because we’ll be using a mix of images and sound files, we’ll use HubSpot’s File Manager to help us serve the files and make them accessible to our module in the cloud\. I’ll show you how to upload from the CLI, and then see those files in the File Manager\.

In your terminal, you should be in your root `hubspot-local`  directory, and it should look like this:

```
deal-fishing.module/
assets/
hubspot.config.yml
```


Now, we’ll just upload the `assets` folder to the File Manager with the following command:

```
hs filemanager upload assets assets
```


That’ll take our local assets folder and put it in a new top\-level folder on the File Manager also called `assets` \.

Now, open your sandbox account back up in HubSpot, and open the File Manager from the top navigation bar:
> Marketing > Files and Templates > Files
That’ll show you a screen like this:

![](/assets/images/9aee802e88e724ff757b3bdceb3c3741.png)

Great\! It looks like it worked – you can see `assets` hanging out there\. Now, open up the assets folder, and select any of the files\. We’ll be using their URL to load the file into Phaser\. When you’ve clicked on a file inside the assets folder, a sidebar opens\. Press ‘Copy URL’:

![](/assets/images/66366feda56a80b0153533ecd82849b3.png)

That should give you a URL like `https://f.hubspotusercontent20.net/hubfs/1234567/assets/atlas.png` \. Now we’re going to add that URL in front of our assets\. Take the first part of the URL – the part before `/assets/atlas.png` , and add it to each `load` call URL so that your code looks like this:

```
function preload ()
{
	// this refers not to the game object - but the scene!
	this.load.image('ground', 'https://f.hubspotusercontent20.net/hubfs/1234567/assets/atlas.png');
	this.load.spritesheet('pond', 'https://f.hubspotusercontent20.net/hubfs/1234567/assets/pond.png', { frameWidth: 54, frameHeight: 39});
	this.load.spritesheet('tile', 'https://f.hubspotusercontent20.net/hubfs/1234567/assets/tile.png', { frameWidth: 16, frameHeight: 16});

	this.load.spritesheet('fishA', 'https://f.hubspotusercontent20.net/hubfs/1234567/assets/FishA.png', { frameWidth: 16, frameHeight: 16});

	this.load.spritesheet('player', 'https://f.hubspotusercontent20.net/hubfs/1234567/assets/hero.png', { frameWidth: 16, frameHeight: 24});
}
```

Bravo\. You’ve written your first chunk of code for Phaser\. Let’s walk through it\!

`this` refers to the scene\. A scene contains game objects – it’s a bit like the world that you’re immediately playing in\. More complicated games can have several different scenes that the game will move you through \(for instance, as you’d complete one level and move onto the next\)\. But we’re going to do all our work in just one of them\.

After that, we call the `spritesheet` and `image` methods\. What’s the difference? Well, `image` just takes the whole image, figures out its dimensions, and pastes it on the screen\. But if we want to create animations, or just select one piece of an image to create a game object from, we should use `spritesheet` \. Our player uses a spritesheet, but the main part of the map just uses `image` \.

Each spritesheet and image is passed two parameters\. The first is the key we’ll use to refer to the asset in the future – for `atlas.png` , it’s `ground` \.

Now we’re ready to start adding stuff to the map, and we’ll see our first game objects appear\.
### Creating your scene
Let’s take those assets and put them to use\!

First, we’ll add our main map – the `atlas.png` image, which we’ve given a key of `ground` \. Now, in `create()` , we’ll get to use it:

```
function create ()
{
	this.add.image(400, 300, 'ground').setScale(2);
}
```


Here, we’re calling `add.image()` on the scene, and passing it the coordinates, as well as the key of the image we want to add\. Here, we want to add our `ground` image to the very middle of the view\. And since our Phaser instance was instantiated with a width and height of 800 and 600, and since the origin of the image is at its center by default, we can just divide that original width and height in two to put the `ground` image at the center of the map\. Finally, we use `setScale(2)` to double it in size – without that, the image is pretty small for the viewport\.

That should show up immediately in your Previewer – but it doesn’t look super great:

![](/assets/images/da1a01944bc7e361acf5b92ed3929aec.png)

There’s so much black space\! We’ll fix that by also adding a `tile` template in\.

```
function create ()
{
	// this gets called once, after `preload` is finished
	// anything loaded in `preload` is guaranteed to be accessible here
  this.add.tileSprite(400, 300, 800, 600, "tile");

  this.add.image(400, 300, 'ground').setScale(2);
}
```

It looks pretty similar to what we did with the image above, but it’s a different method, to reflect that it’s a background tile made from a spritesheet\. We also put it first, because if we didn’t, it’d show up on top of our more detailed map\. Whatever we add last to the background will show up on top\.

Finally, we better add an object to our map where we can go fishing: the pond\! For that, we’re going to first create a group, and then add a game object to it based on the `pond` spritesheet\. That spritesheet has many different states that we can build animations on top of – take a look at it\!

![](/assets/images/71eeee10925cb8e1b8b1043f42a03020.png)

To add the first, left\-most image of the pond to the map, we’re first going to create two variables, and add them above where we declare `game` :

```
var pond;
var pondGroup;

var game = new Phaser.Game(config);
```


Rather than adding `pond` directly to the scene, we’ll keep it in a `pondGroup` \. That’ll help us organize other pond\-related game objects in the future\.

Now add this to the end of `create()` :

```
  ...
	// create pond
	pondGroup = this.physics.add.staticGroup();

	pond = pondGroup.create(390, 420, 'pond', 0).setScale(2).refreshBody();
}dGroup\.create\(390, 420, 'pond', 0\)\.setScale\(2\)\.refreshBody();
\}
```


That places the pond in a nice open area, chooses the `pond` spritesheet key, and uses the 0 index to grab the first frame from it\. Then we use `setScale` to make it bigger, and because it’s a sprite, we also have to call `refreshBody()` to get the scene to re\-render it\.

Now we’ve got a pond, and a beautiful green 8\-bit world\. How about we add a player to play with? It’s pretty straightforward, and a lot like adding the pond\. First, add a new `player` var at the top, then in `create()` at the bottom, instantiate it:

```
var pond;
var pondGroup;
var player;

var game = new Phaser.Game(config);

...

function create ()
{
	...
	// create player
	player = this.physics.add.sprite(100, 450, 'player');
	player.setCollideWorldBounds(true);
}
```


Beautiful\. Here, we’re adding the `player` variable, then using `this.physics.add.sprite()` to add it to the world\. This way, the game knows to keep track of the player as an object that physics should apply to – so that we can add collisions to it more easily, thereby allowing it to interact with other objects\. We take advantage of Phaser’s physics immediately by using `setCollideWorldBounds(true)` to prevent the player from walking outside of the visible game area\.

Now that we’ve got the player, it’s time to add animations and controls so that the player can move around, also at the bottom of `create()` :

```
function create ()
{
	…

  this.anims.create({
    key: 'sideways',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2}),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'down',
    frames: this.anims.generateFrameNumbers('player', {start: 8, end: 10}),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'cast',
    frames: [ {key: 'player', frame: 3}],
    frameRate: 20,
    repeat: -1
  });

  this.anims.create({
    key: 'up',
    frames: this.anims.generateFrameNumbers('player', {start: 4, end: 6}),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'caughtFish',
    frames: [{key: 'player', frame: 13}],
    frameRate: 20,
    repeat: -1
  });
}
```


When we create an animation, we pass along a `config` map\. Usually, it contains a key \(so we can keep track of the animation with a descriptive name\), the relevant frames from a loaded sprite \(either 1 or more\),  a frame rate, and how many times the animation should repeat before ending and firing an `animationcomplete` notification\.

Now, it’s time to actually move the player around\. First, we’ll create a `cursors` variable at the top, then instantiate it at the end of `create()` :

```
var pond;
var pondGroup;
var player;

var cursors;

var game = new Phaser.Game(config);

…

function create ()
{
  …
  cursors = this.input.keyboard.createCursorKeys();
}
```


Phaser gives us this handy way to watch all the typical keyboard events you might need for your game – arrows, spacebar, and enter are all available through `createCursorKeys()` \.

Now we have to use the cursors to move the player around\. That’s where `update()` comes in\.

While `create()` gets called once, the game loop constantly loops over `update()` in order to run logic that should update the game in real\-time\. Movement, interactions between objects, and more can all be handled here\. In our little game, we’ll be handling both movement and fishing logic in `update()` \.

So, here’s what we’ll start out with in `update()` :

```
function update ()
{
  if (player.state != "fishing") {
    // movement is allowed
    if (cursors.up.isDown) {
      player.setVelocity(0, -160);

      player.anims.play('up', true);
    } else if (cursors.down.isDown) {
      player.setVelocity(0, 160);

      player.anims.play('down', true);
    } else if (cursors.left.isDown) {
      player.setVelocity(-160, 0);

      player.setFlipX(false);
      player.anims.play('sideways', true);
    } else if (cursors.right.isDown) {
      player.setVelocity(160, 0);

      player.setFlipX(true);
      player.anims.play('sideways', true);
    } else {
      // if the above keys are being pressed, the user shouldn't be moving
      player.setVelocity(0, 0);

      player.anims.pause();
    }
  }
}
```


The first two conditions are about moving up and down, which requires an animation and setting the player’s velocity\. The first two conditions help manage left and right running – by setting the velocity of the player, and flipping the same `sideways` animation\. And the final `else` clause is to stop animations and set the velocity to zero if you aren’t holding any of the arrow keys\.

Also, we’re wrapping this all within a `player.state != "fishing"` condition, which will help make sure that the player can’t move around the map while casting a line\.

Head back to your Previewer tab, and check it out – your player moves\! But wait\. Maybe the hero shouldn’t be able to go right into the pond\.

![](/assets/images/5da40364590cb41aae38d972ea9461da.png)

To prevent that, we’ll create a collider between the player and the pond\. In `create()` , after you create the pond and the player, you add `this.physics.add.collider(player, pondGroup);` :

```
function create ()
{
	// this gets called once, after `preload` is finished
	// anything loaded in `preload` is guaranteed to be accessible here
  this.add.tileSprite(400, 300, 800, 600, "tile");

  this.add.image(400, 300, 'ground').setScale(2);

  // create pond
  pondGroup = this.physics.add.staticGroup();

  pond = pondGroup.create(390, 420, 'pond', 0).setScale(2).refreshBody();

  // create player
  player = this.physics.add.sprite(100, 450, 'player').setScale(2).refreshBody();
  player.setCollideWorldBounds(true);

  this.physics.add.collider(player, pondGroup);
  …
}
```
Better\! This uses the built\-in physics engine to notice when the bounds of the player intersect with the bounds of the `pondGroup` to then prevent them from overlapping\.

### Interacting with the pond
If we were so inclined, we could use events to fire a callback when the player collided with the pond, then make fishing automatically begin\! But that’s kinda against the spirit of fishing, in my opinion\. Half of the fun is casting the reel\!

So instead, we’re going to try a different strategy that involves waiting to see when the player is in a zone, and *then* allowing them to cast the reel\. We’ll do it all in `update()` to keep things straightforward\.

To begin, we’ll create a zone that’s slightly bigger than the pond, and use that to notice when the player is in a fishable area\. When the player and the zone are overlapping, we’ll allow the player to cast their lure and catch the big fish\.

First, we’ll create a zone variable up top, and then instantiate it inside the `create()` function, after you add the collider to the pond and player:

```
var pond;
var pondGroup;
var player;
var fishingZone;

var cursors;

var game = new Phaser.Game(config);

…

function create ()
{
	// this gets called once, after `preload` is finished
	// anything loaded in `preload` is guaranteed to be accessible here
  this.add.tileSprite(400, 300, 800, 600, "tile");

  this.add.image(400, 300, 'ground').setScale(2);

  // create pond
  pondGroup = this.physics.add.staticGroup();

  pond = pondGroup.create(390, 420, 'pond', 0).setScale(2).refreshBody();

  // create player
  player = this.physics.add.sprite(100, 450, 'player').setScale(2).refreshBody();
  player.setCollideWorldBounds(true);

  this.physics.add.collider(player, pondGroup);

  // instantiate and enable physics for the fishing zone
  fishingZone = this.add.zone(pond.x, pond.y, pond.width + 2, pond.height).setScale(2);
  this.physics.world.enable(fishingZone);

  …
}
```


Here, we can see us add the zone to the scene with `this.add.zone()` , including making it slightly wider than the pond\. Then we enable physics on the `fishingZone` – that allows us to check for collisions and overlaps\.

In this case, we’ll use an overlap\. That means some part of one object is within the bounds of another – whereas collisions just mean they bumped up against each other once\. Overlaps are better for game logic that needs to happen when a game object stays in a given area – as an angler might\!

So where do we check for an overlap? Well, first, let’s take stock\. We need to do two things at once: we need to see if there’s overlap, and then see if there’s a spacebar being pressed \(which we’ll use to cast the line and begin the fishing\)\.

Here’s what
1. We could listen for overlap events, and if the overlap event involves the player and the `fishingZone` , we could check if the spacebar is pressed\.
2. We could just put the logic in `update()` , and check if the spacebar is depressed at the same time as there’s also overlap\.

Either seems like it could work well\! In this tutorial, I’m going to choose option #2, because it’ll play a little more nicely with our controls\. If we put the `else if` statement in the right place, it’ll mean we’re only going to look for a spacebar press if the player isn’t also running around the screen – and it’d be a bit weird if the player could run and fish at the same time\. Again, we must make a stand for the spirit of the sport\.

So we’re going to first create a new `spacebarHeld` variable to keep track of whether the user has released the spacebar, and then add a new set of conditions at the end of `update()`  to handle spacebars and fishing:

```
function update ()
{
  if (player.state != "fishing") {
    // movement is allowed
    if (cursors.up.isDown) {
      player.setVelocity(0, -160);

      player.anims.play('up', true);
    } else if (cursors.down.isDown) {
      player.setVelocity(0, 160);

      player.anims.play('down', true);
    } else if (cursors.left.isDown) {
      player.setVelocity(-160, 0);

      player.setFlipX(false);
      player.anims.play('sideways', true);
    } else if (cursors.right.isDown) {
      player.setVelocity(160, 0);

      player.setFlipX(true);
      player.anims.play('sideways', true);
    } else {
      // if the above keys are being pressed, the user shouldn't be moving
      player.setVelocity(0, 0);

      player.anims.pause();
    }
  }

  if (cursors.space.isDown && (this.physics.world.overlap(player, fishingZone)) && spacebarHeld === false) {
    spacebarHeld = true;
    console.log("Fishing!")
  } else if (cursors.space.isUp) {
    spacebarHeld = false;
    player.anims.pause();
  }
}
```

Wow, we’re close now\. When you open your console in the Previewer tab, you should now see `Fishing!` pop up when you press space beside the pond\. We’ve added a couple clauses to accomplish that\. The first one checks to see if:
- the player is overlapping the pond zone,
- the spacebar isn’t already being depressed,
- and the spacebar is down\.
Then, the second statement handles when the spacebar is finally released, and sets the `spacebarHeld` variable to false, making it so we don’t constantly run the first statement’s logic for as long as the spacebar is depressed\.

We’re finally ready to show the fishing animations\!

### Fishing
Now that we’ve got some good, reliable fishing\-is\-now\-happening logic, we can begin to write code to trigger animations and states based on it\. First, we’re going to add a few animations for the pond: one at rest, one while waiting for a fish to bite, and one for when a fish has bitten\. We’ll then add the logic for what each spacebar press can do: before starting fishing, while fishing and waiting for a bite, and one for when you get a bite and then press spacebar\.

We’ll add the animations first in `create()` , with the rest of our animations:

```
function create ()
{

  …

  // pond animation
  this.anims.create({
    key: 'pondFishing',
    frames: this.anims.generateFrameNumbers('pond', {start: 1, end: 2}),
    frameRate: 1,
    repeat: -1
  });

  this.anims.create({
    key: 'pondStill',
    frames: [ {key: 'pond', frame: 0}],
    frameRate: 20,
    repeat: -1
  });

  this.anims.create({
    key: 'pondBite’,
    frames: this.anims.generateFrameNumbers('pond', {start: 3, end: 4}),
    frameRate: 5,
    repeat: 4
  });

  …

}
```


A couple quick things to note here: the `pondFishing` and `pondStill` animations will run indefinitely \(because of the `repeat: -1` key\), but `pondBite` will repeat 4 times, for about a second total\. We’ll see how that’s useful shortly\!

Now we’re going to put those animations to use\. In `update()` , we’ll add the animation logic to our main fishing condition:

```
function update ()
{
  …
  if (cursors.space.isDown && (this.physics.world.overlap(player, fishingZone)) && spacebarHeld === false) {
    spacebarHeld = true;
    console.log("Fishing!")

    if (player.state === "fishing") {
      // The player is currently fishing

    } else {
      // The player should begin fishing!
      player.anims.play('cast', true);

      pond.anims.play('pondFishing');
    }

  } else if ………
}
```


First, we’re going to use `player.state` to keep track of when the user is fishing\. Game objects all have a state property, so we just set it to a string\. Then we add some logic around that: if the player is currently fishing, we’ll soon do some other things there to check if they successfully caught the fish\. For now, we just want to specify what happens when they press spacebar and aren’t yet fishing\.

In that `else` statement, we begin by playing the `cast` animation on the player\. It’ll last indefinitely, as we set its `repeat` key to `-1` \.

For the pond animations, we’re going to do some trickery\. We want the pond to start by playing an animation for when you’re fishing but when the fish hasn’t yet bitten\. So, we start by getting the `pond` object to play the `pondFishing` animation\. Then, we want the next `pondBite` animation to start randomly so as to add a little element of surprise, and we’ll have to do that in a sneaky way\. Here’s what we end up with – including a new function called `finishedFishing()` :

```
function update ()
{
  …
  if (cursors.space.isDown && (this.physics.world.overlap(player, fishingZone)) && spacebarHeld === false) {
    spacebarHeld = true;
    console.log("Fishing!")

    if (player.state === "fishing") {
      // The player is currently fishing

    } else {
      // The player should begin fishing!
      player.anims.play('cast', true);

      pond.anims.play('pondFishing');

      pond.anims.chain('pondBite');

      pond.anims.stopAfterDelay(Phaser.Math.Between(2000,4000));

      pond.on('animationcomplete-pondBite', finishedFishing);
      pond.anims.chain('pondFishing');

      player.state = "fishing";
    }

  } else if ……
}

function finishedFishing (animation, frame, gameObject)
{
  if (player.state === 'fishing') {
    // stop the current animation
    pond.anims.stopAfterDelay(Phaser.Math.Between(2000,4000)); // random

    // add a new animation
    pond.anims.chain('pondBite');
    pond.anims.chain('pondFishing');
  }
}
```



So, after `pondFishing` gets played, we use `pond.anims.chain` to add the next animation – `pondBite` \. Whenever the currently playing animation stops, the animation manager will automatically play the next chained animation\. As a result, we add a `stopAfterDelay` call with a random interval\. The randomness will add a little surprise, making the game more compelling, and the stop itself will cause the `pondBite` animation to begin playing\.

Finally, we’re going to need to keep things going\. First, we’ll add a listener for the `pondBite` animation’s ending, which will call `finishedFishing()` \. Then we chain `pondFishing` again, which will automatically start once `pondBite` ends\. Finally, we make sure to set the player state to `fishing` \.

In our `finishedFishing()` function, we do the same thing: stop the current animation, then chain `pondBite` and `pondFishing` once more\. Now we have a self\-regenerating chain of animations that will continue as long as our player keeps fishing\.

Jump in the game and get your player to fish\! You should see the following happen: the larger, slower ripples of `pondFishing` are followed within a couple seconds by the fast ripples of `pondBite` , all of which repeats\.

But the player can’t catch the fish\! Let’s fix that now\.
## Catching the fish
We’re wrapping things up now\. Here’s what our final `update()` function looks like:

```
function update ()
{
  if (player.state != "fishing") {
    // movement is allowed
    if (cursors.up.isDown) {
      player.setVelocity(0, -160);

      player.anims.play('up', true);
    } else if (cursors.down.isDown) {
      player.setVelocity(0, 160);

      player.anims.play('down', true);
    } else if (cursors.left.isDown) {
      player.setVelocity(-160, 0);

      player.setFlipX(false);
      player.anims.play('sideways', true);
    } else if (cursors.right.isDown) {
      player.setVelocity(160, 0);

      player.setFlipX(true);
      player.anims.play('sideways', true);
    } else {
      // if the above keys are being pressed, the user shouldn't be moving
      player.setVelocity(0, 0);

      player.anims.pause();
    }
  }

  if (cursors.space.isDown && (this.physics.world.overlap(player, fishingZone)) && spacebarHeld === false) {
    spacebarHeld = true;
    console.log("Fishing!")

    if (player.state === "fishing") {
      // The player is currently fishing
      if (pond.anims.getCurrentKey() === "pondBite") {
        // there's a catchable fish!
        // first, create a fish object
        fish = this.physics.add.sprite(pond.getCenter().x, pond.getCenter().y, 'fishA', 4).setOrigin(0.5, 0.5).setScale(3).refreshBody();
        // then animate it up to the top of the player's body
        var tween = this.tweens.add({
          targets: fish,
          x: player.getTopCenter().x,
          y: player.getTopCenter().y,
          ease: 'Linear',
          completeDelay: 1000,
          onComplete: function () {
            fish.destroy();
            player.state = "normal";
          }
        });

        // now we'll show the player celebrate
        player.anims.play('caughtFish', true);

        // we'll clear the pond's animation chain and reset everything
        pond.anims.stop();
        pond.anims.play('pondStill');
      } else {
        // just stop fishing
        player.anims.play('sideways', true);

        pond.anims.play('pondStill', true);

        player.state = "normal";
      }

    } else {
      // The player should begin fishing!
      player.anims.play('cast', true);

      pond.anims.play('pondFishing');

      pond.anims.chain('pondBite');

      pond.anims.stopAfterDelay(Phaser.Math.Between(2000,4000));

      pond.on('animationcomplete-pondBite', finishedFishing);
      pond.anims.chain('pondFishing');

      player.state = "fishing";
    }

  } else if (cursors.space.isUp) {
    spacebarHeld = false;
  }
}
```


 The new logic is all in the `if (player.state === "fishing")` clause\. There, we handle two situations: one, where the `pondBite` animations is playing, which should let the player catch the fish if they press space\. The second is if they press space when the `pondBite` animation isn’t playing, in which case fishing should stop, and they’ll have to try again\.

To get the fish from the pond to above the player’s head, we use what’s called a ​*tween*​\. It’s an object managed by the scene which allows us to manipulate values over time\. We use it to change the x and y position of the fish, then pass an `onComplete` callback to destroy the fish and reset the player state to `"normal"` after a delay\.

Finally, we change the player’s animation, empty the animation chain for the pond, and set the pond back to `pondStill` \.

In the second clause, where the player should stop fishing because they didn’t time the bite correctly, we do more or less the same thing to reset the scene: set the player and pond animations to neutral ones, and set the player state to `"normal"` \.

That’s it for now\. Enjoy your working game, welcome to the HubSpot Carnival, and happy fishing\!

## Introducing Serverless Functions
### Posting to HubSpot

### Creating a scoreboard
## Sharing your game
### Adding your module to a template
From the Design Manager, go get your Module’s ID\.

```
<\!\-\-
```

    ```
templateType: page
```

    ```
label: Page template
```

    ```
isAvailableForNewContent: true
\-\->
<\!doctype html>
<html>
```

  ```
<head>
```

    ```
<meta charset="utf\-8">
```

    ```
<title>\{\{ content\.html\_title \}\}</title>
```

    ```
<meta name="description" content="\{\{ content\.meta\_description \}\}">
```

    ```
\{\{ standard\_header\_includes \}\}
```

  ```
</head>
```

  ```
<body>
```

    ```
\{\% module "module\_15982986054391" path="/deal\-fishing", label="deal\-fishing" %\}
```

    ```
\{\{ standard\_footer\_includes \}\}
```

  ```
</body>
</html>
```



### Getting a public link
