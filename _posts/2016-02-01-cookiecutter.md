---
title: Move (really) fast and make things – with Cookiecutter
layout: post
permalink: move-really-fast-and-make-things-with-cookiecutter
---
A few weeks ago, after Rdio announced that they’d be closing up shop, I sprang into action to make an app called [Byedio](https://www.byedio.com). It would be an app to painlessly transfer your songs from Rdio to Spotify in one click, and it would have to start doing this soon - before Rdio actually shut down!
<!--more-->
But first, I had to re-learn everything about building and deploying Django web apps. Mostly, I build RESTful APIs, so remembering how to deal with templates and CSS and session cookies made me way more stressed than I should have been. Heck, [this bug lost me a whole day](http://stackoverflow.com/questions/33822612/custom-django-authentication-backend-doesnt-log-user-in-first-time-but-works-s).

The worst part was that most of these problems were ones I’d already solved. So, I vowed to never waste another day configuring another Django project. I would make a template that is built on my past work, responsive to my current needs, easy to deploy on Heroku, and full of friendly little reminders about best practices.

To make a template project that could pull all this off, I would use **[cookiecutter](https://github.com/audreyr/cookiecutter)**. It makes it easy to make project templates, so that getting started on a new project is dead simple.

### Me have cookie
Built by the incredible folks over at [Two Scoops](https://www.twoscoopspress.com/), `cookiecutter` builds projects by using Jinja2 templating. Think of it as a way to easily generate the scaffolding of your projects, on any platform or language. There are tons of cookiecutter templates that already exist, so it's usually as simple as finding the right repo for your situation - but as we'll see, it's easy to adapt and make your own.

To get started, find the cookiecutter repo you want, then clone it (here's [a list of all of them](https://github.com/audreyr/cookiecutter#available-cookiecutters)). In this tutorial, I'm going to be using and adapting [cookiecutter-django](https://github.com/pydanny/cookiecutter-django).

First, you install the `cookiecutter` package in your virtualenv, then run it with the URL of the cookiecutter repo you want:
```
$ pip install cookiecutter
$ cookiecutter https://github.com/pydanny/cookiecutter-django.git
```
Then `cookiecutter` asks you a bunch of questions, which it uses to fill in its template:
```
project_name [project_name]: cookieeaterapp
repo_name [Reddit_Clone]: cookieeater
...
now [2015/11/22]: 2015/11/22
year [2015]:
use_whitenoise [y]: n
use_celery [n]: y
use_mailhog [n]: n
use_sentry [n]: n
use_newrelic [n]: y
use_opbeat [n]: n
windows [n]: n
use_python2 [n]: y
```
Your answers get handled by the Jinja2 templating language, and that’s how cookiecutter adapts the template files to your desires. It’s pretty powerful – cookiecutter can even customize folder and file names based on what you’re building.

That’s it: you run cookiecutter, answer a few questions, and you’ve got a ready-to-deploy scaffolding on which to build the rest of your app! But what if you want to customize a thing or two?

### Me want cookie
Modifying a cookiecutter template is dead simple. By adding additional questions to `cookiecutter.json`, you can give cookiecutter the variables that will adapt your template to any user preferences.

We'll start by cloning the `cookiecutter-django` template into a new repo.
```
$ mkdir cookiemonster & cd cookiemonster
$ git clone https://github.com/pydanny/cookiecutter-django.git
```

In this example, I'm going to give myself some additional stylesheet options. `cookiecutter-django` includes Bootstrap, which is cool and all, but what if it doesn’t pop enough for my taste? Time to add an option for different styles.

In `cookiecutter.json`, I'll add a new key-value pair at the end of the dictionary:
```
{
	...
	"use_python2": "n",
    "style_name": "bootstrap"
}
```
The value is what `cookiecutter` will use as the default. Also, it needs really well-formed JSON here, so make sure your final entry in that dict doesn't have a comma.

Now I'm going to refer to cookiecutter's `style_name` property whenever I need to see what the user decided. Since `style_name` is supposed to change the stylesheets, I add some control flow to `static/project.scss` using the Jinja2 syntax:
```
{% raw %}
{% if cookiecutter.style_name == “mid90s_webdesign” %}
	$crazy-green: #66ff33;
	body {
	  background-color: $crazy-green;
	}
	p {
	  font-family: 'Comic Sans';
	}
{% elseif cookiecutter.style_name == “bootstrap” %}
	# the bootstrap scss styles
{% endif %}
{% endraw %}
```
Anything that Jinja2 does, cookiecutter can handle. It's not too different from Django's template language, but there are differences, so [their docs are worth reading](http://jinja.pocoo.org/docs/dev/).

Whatever else you add into the root cookiecutter folder - `/{{cookiecutter.repo_name}}` - will show up in the projects you generate from it. Personally, I'm going to add a bunch of mock views to `project_name/views.py` inside that root folder, as well as a few mock tests to remind me how to test those views, because this is the sort of stuff I always forget how to do properly.

But that might not always be helpful to see. So if I wanted to have the option of getting rid of this boilerplate code, I could add `"show_boilerplate": "y"` to `cookiecutter.json`, and surround all boilerplate code with conditionals:
```
{% raw %}
{% if cookiecutter.show_boilerplate == "y" %}
# my super helpful best practices
{% endif %}
{% endraw %}
```

Remember, DRY applies more than ever with templates. You'll want to add the stuff that you'd otherwise have to write over and over again, like tests and config files. Keep your workflow DRY by adding the stuff you keep repeating every time you set up a new project.

### Me eat cookie
We’ve got the cookiecutter template ready to go, but how about deploying the apps you make with it? Good news: you can set up your cookiecutter to add a README.rst file with a “Deploy to Heroku” button, so that the projects you build from cookiecutter can be deployed with a single click.

First, set up the `README.rst` and Heroku button in your cookiecutter template's `{{cookiecutter.repo_name}}` folder. It takes a couple parameters, and should look like this in your `README.rst`:
```
.. image:: https://www.herokucdn.com/deploy/button.png
    :target: https://heroku.com/deploy?template=FULL_GITHUB_REPO_URL_FOR_YOUR_COOKIECUTTER

```
Fortunately, if you’ve pushed your cookiecutter repo to Github and it’s public, Heroku will read the referer header and deploy the repo at that URL, so no parameters are necessary: `https://heroku.com/deploy`. But if you've got a private repo, just add the above template parameter in.

Now, whenever you make a project from your cookiecutter template, that button will make deploying that new project easy. Let's run through that now: we'll make a new project called `cookietester` from my custom cookiecutter template:
```
mkvirtualenv cookietester
pip install cookiecutter
cookiecutter https://github.com/andkon/cookiemonster
project_name [project_name]: cookietester
repo_name [Reddit_Clone]: cookietester
...
git add .
git commit -m "Cookies made and ready to go."
git remote add origin git@github.com:andkon/cookietester.git
git push -u origin master
```
And then on your Github repo page for cookietester, you'll see a nice button like this:

[![Alt text](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/andkon/cookietester)

Click it, sign in, and fill out your env variables – and that's it! You're ready to rock.

### Me love cookie
With cookiecutter and a basic understanding of Jinja2 templates, you can fill in any details you'd like. One restriction is that while you can change filenames with on template variables, you can't easily add or remove files from the final project based on user input.

But that's not so much a problem as a way to keep your templates from getting overloaded. And now that you know how to make and adapt cookiecutter templates, you'll be able to make whatever your heart desires, and to make it fast, too. A template for RESTful Django APIs? An easier way to get started with a new Phoenix/Elixir webapp? Cookiecutter makes these templates easy to design, easy to work with, and easy to deploy.
