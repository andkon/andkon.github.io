---
title: A Christmastime Story About Automating Your Appointments
subtitle: With Heroku, and Twilio, and Hope for the New Year
category: writing
background_image: caleb-woods-485971-unsplash.jpg
---
I'd been trying without much success to get an appointment to put on winter tires at my local Costco. If you get up early enough, you can go wait in line and they'll do it for you, but who wants to get up at 6am? For that, I'll wait until I'm a more elderly Costco patron, with fewer demands upon my time. Fortunately, Costco uses an online scheduling webapp to book appointments, whose API calls I could examine!

Thus began an exhaustive foray into discovering just how many appointment openings I could get notifications about, using Chrome dev tools, Heroku Scheduler, and extremely simple Python scripts.

<!--more-->

Given that Costco tire appointments don't seem prone to scalping, there aren't a whole lot of things in the way of just observing and repeating the API calls that `www.costcotireappointments.com` makes. Once you login, choose a store, and a type of service, the webapp makes an API call with a lot of things as URL parameters:

```
https://costcotireappointments.ca/api/appointments/get-open-slots?location_id=533&addon_ids%5B%5D=32&service_id=43&start_date=20181116&daysIncrement=25
```

That wasn't quite enough, by it's lonesome, to actually get back any appointment availabilities for my nearby Costco. So I grabbed the whole request as cURL from the Network tab in Chrome's Developer Tools, then imported it into Paw so I could pick apart what was going on, because cURL is extremely overwhelming to me.

It turned out you also needed to add a token under `Authorization`, but that token timed out in just a day. I figured I'd have to figure out how to get new tokens. So, I decided to just abandon the whole project, because of much unresolved trauma dealing with underdocumented authentication APIs.

A week later, though, my car still had summer tires on, and it had actually snowed, so I opened Chrome again, looked for an auth call, and hoped it wasn't gonna be super frustrating. Mercifully, I saw that it really was just a simple HTTP request that returned a bearer token, which I could run again before every tire appointment request if I so wanted, and use the returned token to sign them. That was all I needed!

Paw also can build requests in whichever language you'd like using extensions, so I exported the auth and appointment requests into Python and wired them up into something I could run from the command line.

Out of sheer laziness, having felt I'd already wasted far more time on this than I should have, I was hoping to run a script that needed no database, which I could run at a regular interval, and which would text me whenever an appropriate appointment came up. The gist (and [the Gist, for those who are interested]()) was that I wrote a simple Python script that took a location name and looked for the next appointment, and if one existed, it texted me (using Twilio). As far as booking went, I figured that I could, as a very online person betting that no one had found a way to watch for real-time changes to Costco's schedule, do it on my own from there.

The real interesting part was in deciding where this script should run. I love Raspberry Pis, and I love using them to make conceptual art projects, but I do not love the creeping sense of dread that accompanies their silence, for it may herald the absence of appointments, or simply be a reflection that, for whatever reason, the Raspberry Pi decided it couldn't do what I was asking of it any longer.

So I used Heroku. Heroku has an add-on called Heroku Scheduler, which lets you run any command that your app would understand for free (or for money, if you'd like it to run said commands with vigour). You deploy a repo to Heroku, start up Scheduler, tell it to run `python costcotires.py` every 10 minutes, and then it just works. If you wanted to be more creative, you could add some logic to the script itself to prevent it from texting you while you sleep, where your phone might taunt you with a notification you won't notice until it's too late. But that didn't happen to me, and I'm sure the fine folks at Costco probably aren't going to wake up in the middle of the night, report to work, and make available the appointment that you ought to have snagged for yourself but for their moonlit interventions. On either end of this whole affair, there are still reasonable people with sleep schedules to observe, and I took some solace in that.

What else could you do with this newfound superpower? I'm glad you asked. In the weeks leading up to the winter holidays, barber appointments go really fast. So I did the same Dev Tools sleuthing for my barber's site, and was surprised to see that it makes unauthenticated requests to see a barber's availability. My barber has her own UID, which is passed as a URL parameter, and I setup the resulting Python script to watch the weeks leading up to, but not including, my trip back home for Christmas.

It worked. I told my barber, who is great, and she was mad stoked that I'd written a program to get to sit in her chair. She told everyone around us, and everyone was very impressed, and I felt like I'd written my most important piece of code this year. What a weird, wonderful thing we can do with our hopes and our keyboards. Merry Christmas, seasons greetings, and happy new year!
