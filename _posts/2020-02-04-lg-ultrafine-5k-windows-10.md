---
title: "My Adventure in Running the LG Ultrafine 5k Display on Windows 10"
background_image: IMG_3805.jpeg
---

I’d ended up with this really nice display that worked well with my USB\-C and Thunderbolt 3\-having Mac laptop, but I just assumed it would be impossibly hard to get running on Windows, so I just didn’t bother\.

But then I found [Shantanu Joshi’s helpful post in describing how to get it running](https://shantanujoshi.github.io/lg-5k-windows/), and figured: well, how about I try? In the three years that have passed since that post was published, a few things have changed, but not much, and after a couple false starts, I now have my PC pushing a full 5k, 60hz image\! Here’s what I learned\.
<!--more-->
## The setup
To keep my Skylake\-era Intel CPU, I’d need a new or used Z270 motherboard that supported Thunderbolt 3, a Thunderbolt 3 AIC, and a Thunderbolt 3\-over\-USB\-C cable that supported 40GB bandwidth\. Then, I’d connect my graphics card to the DisplayPort ports on the AIC, and then the AIC to the motherboard’s internal Thunderbolt 3 header, and then I’d connect the Thunderbolt 3 port on the AIC to my beautiful LG monitor\.
## Don’t buy used motherboards if you can avoid it
My Z270 motherboard didn’t support Thunderbolt, so I had to buy one that did\. But good luck finding a new Z270 motherboard now\. I found used, appropriate, Thunderbolt 3\-supporting ones, but the first one I bought just plain old didn’t work at all, and the second arrived with bent CPU pins that I had to gently and painstakingly unbend\.

One saving grace: I was able to get a refund for the second motherboard, as I bought it on eBay, and the CPU pin damage wasn’t disclosed\. Small victories\!
## The newer ASRock Thunderbolt 3 r2\.0 AIC works for 5k, but weirdly
I learned that the ASRock Thunderbolt 3 AIC card that Shantanu recommended was both cheap and supported 5k officially, whereas all the other Thunderbolt 3 AICs just seemed to do 4K\. The trick is that it allows two DisplayPort connections: one DisplayPort connection only supports 4K, so if you run two DisplayPort cables from your video card into it, you should be able to run 5K\!

However, I bought the r2\.0 version of the same card, which happened to have an additional internal mini DisplayPort connection – like, you could run it from your graphics card inside your case\. Nice\! But I think it’s just different enough that it’s worth explaining how I got it running\.

Here’s where it gets weird:
- You could get 4k if you ran a single cable into the full\-sized DisplayPort connection on the outside of the AIC, but you couldn’t get any image if you only ran a cable into either of the Mini DP ports\.
- You would still only get 4k if you ran the single full\-sized DisplayPort cable and a cable into the external Mini DP port\. In fact, their included cable was shaped in such a way that a DisplayPort port and the external Mini DisplayPort port couldn’t be plugged in together\.
- You would get an instant 5k, 60hz image if you ran the full\-sized DisplayPort cable, and a cable into the internal Mini DP port\.

So, in short: go buy yourself a longer DisplayPort\-to\-Mini\-DisplayPort cable\.
## It works, but do you really need the resolution?
I’ve got a 1080GTX, which seems to do great in VR, and is able to handle running some games at 4k\-ish\. But it’s not great at putting out that resolution, and it’s hard to tell what massive and expensive GPU you’d need to run games well at 5k\.

More than that: I truly can’t tell the difference from 3200x1800\. When I’m using the 5k display for writing and text editing and coding and all that, the extra real estate helps, and it still looks mega crisp, and my eyes hurt less\. It’s just nice\. But in gaming, it’s not obviously better\. I can see people off in the distance in PUBG just as well at 5k as I could at much lower resolutions\.

Overall, this scratches my itch to do things perfect and seamlessly and “right” far more than it meets any real need the world was screaming out for\.
