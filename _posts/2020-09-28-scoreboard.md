---
title: Carnival Scoreboard
subtitle: Working draft
category: writing
hidden: true
---
Carnivals are all fun and games, but it also helps to win something. In this tutorial, we're going to take the scores we generated from our Ticket Target Practice game, and display them in a Vue-based frontend, backed by a Serverless Function.

# Prerequisites

* a completed Ticket Target Practice app with some high scores
* HubSpot CLI, v2.0+

# Getting setup

First, make sure you've got the latest version of the CLI. To create a Vue app with `hs create`, you'll need at least version 2.0.

```
hs --version
# 2.1.0
```

From the root folder we set up in the Deal Fishing tutorial, we'll create a new folder for our scoreboard, where we'll do our work for this tutorial.

```
mkdir scoreboard
cd scoreboard
```

# Create template and add module

Let's start by making our template, which will let us easily make a page that our Vue app will live in. First, let's use the CLI to create the template:
```
hs create template scoreboard-page
```

Now we can open up the resulting `scoreboard-page.html` file, and replace its contents with the following:

{% raw %}
```
<!--
    templateType: page
    label: Scoreboard template
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
    {% module "cms_vue_boilerplate" path="./cms-vue-boilerplate/modules/app" label="CMS Vue Boilerplate" %}
    {{ standard_footer_includes }}
  </body>
</html>
```
{% endraw %}
It's a pretty straightforward template. In the template-annotation, we set the `label` to `Scoreboard template` so it's easy to search for. Then in the body, we include the module we're going to create containing our Vue app – the `cms_vue_boilerplate` module. The path is absolute – it begins from the home directory of our Design Manager.

## Create a page from the template
With the template created, we're now going to make a page from it like we did in our previous tutorials, which we'll use to develop the app and verify it works. In the top bar of HubSpot, go to `Marketing > Website > Website Pages`, and press `Create` in the top right corner, then select `Website page`.

Click "All of your templates".

With the search bar in the top right, let's search for "Ticket Target Practice template" and select that template. Finally, give it a name – maybe `Ticket Target Practice game`. Click `Create Page`, then we're nearly done.

But it won't let us press publish yet. You'll need to head to the Settings bar and do two things there. First, add a Page Title. Then copy the link to the page. Finally, press Publish, and open up your brand new page:

![](/assets/images/publish.gif)

This is the page and URL we'll use from now on to try the game out as we develop it. Keep it handy! With that page published, we're ready to develop our Vue app.

# Creating a Vue app with the CLI
Using the CLI, we'll use a built-in command for creating a Vue app with a build step. If you'd like to create a Vue app and deploy it to HubSpot without a build step, [check out the docs](https://developers.hubspot.com/docs/cms/guides/js-frameworks#vuejs) for instructions on how to use it via CDN, and some discussion about when that may be helpful.

In our `scoreboard` folder, we'll create a Vue app from a boilerplate template, using the CLI.

```
hs create vue-app
cd vue-app
```

For reference, you can [see how to get started with the HubSpot Vue boilerplate app here](https://github.com/HubSpot/cms-vue-boilerplate/). Unlike our previous Phaser.js-based games, the Vue boilerplate includes some `npm` and `yarn` commands that automatically build and deploy it to HubSpot.

Now that we're in `vue-app`, we'll install the necessary dependencies, add the `axios` HTTP package, and finally start our app up and see it show up in our Design Manager.

```
yarn install
yarn add axios
yarn start
```

With `yarn start`, you should see a lot of output from the build logs, ending with an indication that new files have been uploaded:
```
...
<i> [HubSpotAutoUploadPlugin] Uploaded cms-vue-boilerplate/assets/vue.svg
<i> [HubSpotAutoUploadPlugin] Uploaded cms-vue-boilerplate/main.css
<i> [HubSpotAutoUploadPlugin] Uploaded cms-vue-boilerplate/modules/app.module/module.html
<i> [HubSpotAutoUploadPlugin] Uploaded cms-vue-boilerplate/modules/app.module/fields.json
<i> [HubSpotAutoUploadPlugin] Uploaded cms-vue-boilerplate/assets/sprocket.svg
<i> [HubSpotAutoUploadPlugin] Uploaded cms-vue-boilerplate/modules/app.module/meta.json
<i> [HubSpotAutoUploadPlugin] Uploaded cms-vue-boilerplate/main.js
```

Leave `yarn start` running, and we'll begin developing our app. Let's walk through it before diving in. The code we'll be working on all lives in `/src`. There, we'll open up `App.vue`. Replace the code there with this `<template>`:

{% raw %}
```
<template>
  <div class="cms-vue-boilerplate-container">
    <p>Welcome to…</p>
    <h1>The HubSpot Carnival Scoreboard!</h1>
    <div class="scoreboard">
      <table>
        <thead>
          <tr>
            <th>rank</th>
            <th>name</th>
            <th>score</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="error">
            <td></td>
            <td>Error: {{ error }}</td>
            <td></td>
          </tr>
          <tr v-else-if="loading">
            <td></td>
            <td>Loading…</td>
            <td></td>
          </tr>
          <tr v-else v-for="(item, item_index) in sortedScores">
            <td>{{ item_index + 1 }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
```
{% endraw %}

We'll use a table to show what's happening. If `loading` is true, we'll show a loading message in the table. Otherwise, we'll create a row for each score object in `sortedScores`, showing their rank, name, and score.

Next, let's create the script. Directly below the end of the above code, add the following:

```
<script>
import axios from 'axios';

export default {
  name: 'App',
  props: ['moduleData'],
  data: function() {
    return {
      highScores: null,
      loading: true
    };
  },
  mounted: function() {
    axios
      .get('_hcms/api/high_scores')
      .then(response => {
        var data = response.data;

        // parse into dictionaries
        var newScores = [];

        data.forEach((item, i) => {
          var scoreObject = JSON.parse(item.properties.subject);
          if ("name" in scoreObject && "score" in scoreObject) {
            newScores.push(scoreObject);
          }
        });

        this.highScores = newScores;
        this.loading = false;
      });
  },
  computed: {
  sortedScores: function() {
    if (this.highScores != null) {
      function compare(a, b) {
          if (a.score > b.score) return -1;
          if (b.score > a.score) return 1;
        }
        return this.highScores.sort(compare);
      }
    }
  },
  created: function() {
    // eslint-disable-next-line no-console
    console.log(
      'all of your data typically accessed via the "module" keyword in HubL is available as JSON here!',
      this.moduleData,
    );
  },
};
</script>
```

If you're new to Vue, it might help to know about its reactive architecture. That means that any time that `data` gets updated, it'll automatically refresh any fields in the app that rely on that data.

When the `mounted()` lifecycle function is called, we're going to create an HTTP call to a serverless function that we'll create, and use it to set `this.highScores`, which we've added in our `data` object. Then, we'll use `sortedScores()` to sort those scores from the highest score to the lowest.

Because `mounted()` gets called after the app is loaded and displayed, we'll also have to handle this loading state. That's why we set `highScores: null` and `loading: true` to begin with. When we get an acceptable response from our serverless function, we'll override both those values, and Vue will automatically reload the data on screen.

Finally, as a reminder, we can access any of our module data that we'd usually use in our HubL templates via `this.moduleData`.

Before moving on to see how it looks, let's add the styles to the end of the same file:

```
<style lang="scss">

h1 {
  margin-top: -0.5em;
  font-family: 'Rye', cursive;
}

.scoreboard {
  font-family: 'Press Start 2P', cursive;
  width: 50%;

  table {
    margin: auto;
    background: #212121;
    border-color: white;
    border-style: dashed;
    padding-bottom: 1em;

    th {
      padding: 1em;
      color: red;
    }

    td {
      padding: 0 1em;
    }
  }
}

.cms-vue-boilerplate-container {
  text-align: center;
  background-color: #282c34;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
  padding: 1rem 0 1rem 0;
}

</style>
```
That's it for now! If you save and refresh your scoreboard page, you should see... well, not a lot. Because we haven't yet created our serverless function, we just get a 404, and `Loading...` stays on the screen forever.

It's time to dive into the serverside code.

# Create `high_scores` serverless function
Our serverless function will have to find the appropriate pipeline for the Ticket Target Practice game, then return only the high score tickets from that pipeline's second stage.

Let's get started by creating the function, again in our `scoreboard` folder:

```
hs create function high-scores
? Name of the folder where your function will be created: high-scores
? Name of the JavaScript file for your function: highscore.js
? Select the HTTP method for the endpoint: GET
? Path portion of the URL created for the function: high_scores
Created "~/Developer/hubspot/scoreboard/high-scores/high-scores.functions"
Created "~/Developer/hubspot/scoreboard/high-scores/high-scores.functions/highscore.js"
Created "~/Developer/hubspot/scoreboard/high-scores/high-scores.functions/serverless.json"
[SUCCESS] A function for the endpoint "/_hcms/api/high_scores" has been created. Upload "high-scores.functions" to try it out
```

Now let's begin to watch the folder, so that your changes are automatically made and pushed live:
```
hs watch high-scores high-scores --initial-upload
```

Alright, now we can get things going. First, in `serverless.json`, we have to add `"hubapikey"` to our `secrets` key. Again, you'll have to have set this up in our previous tutorials – head to the Deal Fishing tutorial to see how it's done.

```
{
  ...
  "secrets": ["hubapikey"],
  ...
}
```

Then, let's open up `highscore.js`, where we'll create a request for the pipelines on our account, and then get the tickets on its second stage before responding with them:
```
const hubspot = require('@hubspot/api-client');
const hubspotClient = new hubspot.Client({ apiKey: process.env.hubapikey});

// This function is executed when a request is made to the endpoint associated with this file in the serverless.json file
exports.main = ({ accountId }, sendResponse) => {
  const defaultParams = {
    hapikey: process.env.hubapikey
  };

  // call the HubSpot Pipelines API using the api-client
  hubspotClient.crm.pipelines.pipelinesApi.getAll('tickets', archived=false)
    .then(results => {
      // Handle success
      pipeline = results.body.results.find(obj => obj.label === "Ticket Target Practice Game");

      if (pipeline == null) {
        sendResponse({ body: "No pipeline found", statusCode: 400});
        return
      }

      // now let's search for the high score tickets on that pipeline
      const publicObjectSearchRequest = {
        filterGroups: [
          {
            filters:
            [
              {value: pipeline.id, propertyName: 'hs_pipeline', operator: 'EQ'},
              {value: pipeline.stages[1].id, propertyName: 'hs_pipeline_stage', operator: 'EQ'}
            ]
          }
        ],
        sorts: [
          {
            "propertyName": "createdate",
            "direction": "DESCENDING"
          }
        ],
        properties: ['id', 'subject'],
        limit: 100,
      };

      hubspotClient.crm.tickets.searchApi.doSearch(publicObjectSearchRequest)
        .then(results => {
          // success!
          tickets = results.body.results;
          sendResponse({ body: tickets });
        }).catch(err => {
          console.log(error.message);

          sendResponse({ body: { error: "The search for tickets failed: " + error.message }, statusCode: 500 });
        });
    })
    .catch(err => {
      // Handle error
      console.log(error.message);

      sendResponse({ body: { error: "Getting pipelines failed: " + error.message }, statusCode: 500 });
    });
};
```
At the top, we create a request to the `pipelines.pipelinesApi.getAll` endpoint, which will return all our pipelines on the account. We handle the successful response in `.then()`, where we look for the pipeline object called `"Ticket Target Practice Game"`. If it's not there, we'll return a 400.

If the pipeline is there, we can then craft a search for tickets that are in the appropriate stage for high scores, which we do using `publicObjectSearchRequest`. We fire that off to the `tickets.searchApi.doSearch` endpoint; if that returns something, we'll craft a `sendResponse()` call to return the tickets to our scoreboard app, which will then handle displaying and ordering the data.

With `hs watch` running, the endpoint should be ready to go. And because our Vue app lives on the same domain as our `_hcms/api/high_scores` endpoint, we don't have to update anything in the Vue app's call to the endpoint – we're already calling its relative path. Just refresh, and you should see your scores show up!

![](/assets/images/scoreboard.png)

# Conclusion

That's it! With these three Carnival tutorials, you've seen how quick and effective HubSpot's developer tools are at building useful (or sometimes just fun) webapps. Maybe you've even picked up a couple new skills along the way.

Next, it's up to you. Maybe you'd like to be able to customize the player name with a custom form? Or do you want to create your own Vue app or Phaser game backed by the HubSpot API? Let us know what you build using the #hubspotcarnival and tagging @hubspot, wherever hashtags can be used.
