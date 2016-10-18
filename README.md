![alt text](https://cdn3.kainos.com/wp-content/themes/kainos.com/images/Kainos-Logo.png?dd6334 "Kainos Logo")

# Next Generation Web Technologies #

---

A key role of the Applied Innovation team at Kainos is the investigation of cutting edge technologies, with the goal of evaluating the business value for current or future projects. In the past the team have utilised modern browser based functionality with a focus on creating offline web experiences that can compete with native applications like those found on iOS or Android operating systems. This line of research has proven very successful and the underlying technologies are the basis of the research presented in this repository with a new perspective that targets performance and the user experience. To showcase this a series of use cases have been devised which highlight the advantages of applying modern web techniques to real world problems on the web, more on these later.

# #

So what are these mysterious technologies? 

# #

**Service Worker:** This is a script which runs in the background of a web page (Essentially acting as a proxy between the browser and the network) and has to ability to enable offline experiences, intercept network requests and other interesting tidbits that are examined in this repository. For more information check out this (much more detailed) article from Google [HERE](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers) however if you don't have time for a deep dive into the topic (tut tut) this simple diagram should suffice.

![alt text](sw.gif)

**Web Streams:** When you think of streaming the first thing that comes to mind might be services such as Youtube which play video content as the data downloads. Conceptually this is essentially the same idea and browsers have supported streaming out of the box since the stone age of the internet. I am sure you have experienced rage inducing tortoise like internet speeds like this before:


![alt text](tortoise.gif)


This is essentially streaming, however it is only recently (2016!) that the API has been exposed to developers and allows us to do a bunch of cool things which will be examined later.


# Setup #

---

### Prerequesities ###

You will need a local web server which will be used to deploy the example use cases:

** Mac: ** [Simple Python Server](http://www.andyjamesdavies.com/blog/javascript/simple-http-server-on-mac-os-x-in-seconds)

** Windows: ** [Apache Tomcat](http://tomcat.apache.org)


### How To Run ###
Each use case is encapsulated within its own folder, see below for the list of scenarios that are available to run.

* ImageReverseProxy
* ServerDownLoadBalancerSW
* KeyWordSearchUseCase
* StreamHeaderFooter
* StreamJsonListRender

An example process of running a use case on a Mac using the suggested web server is show below.

![alt text](terminal.gif)


Now you can go to a compatible browser (See FAQ section) and run the use case on the local host port you specified.


![alt text](localHost.gif)


### NOTE ###
When a service worker first visits a page it will need to install before it can take control of the website, don't worry it will be ready to go for all subsequent visits.

you might be thinking, how do I install a service worker anyway? Don't worry I have you covered, just insert this small script into your html page and you are ready to go!


```
#!js
if ("serviceWorker" in navigator) {  
         navigator.serviceWorker.register("/sw.js").then(function(registration) {
         console.log("Service Worker registered");
}).catch(function(err) {
         console.log("Trouble loading the Service Worker: ", err);
});
}
```


# Use cases #
---

** ImageReverseProxy **
The purpose of this scenario is to highlight how a service worker can be utilised to manage the serving of images to the user from a performance standpoint. This showcases the ability of the service worker to act as a proxy which is decoupled from the web page and network, so far we have devised two sub tasks.

* Detect if the browser supports a more efficient compression algorithm such as [WebP](https://developers.google.com/speed/webp/docs/compression) and manipulates the URL to request this format versus the standard Jpeg and PNG images that dominant the web. In supported browsers this will lead to an improved performance in terms of page load and in content driven websites this could be valuable. **Instructions - ** To test this functionality throttle the network connection using dev tools and toggle between the two options presented paying close attention to the load time for each state.
* Detects the resolution of the client device and serve an image quality that is most appropriate for user. This boils down to either showing a high/low resolution image depending if the client device is within a certain threshold. Again this is a performance focused layer of functionality, since high resolution images are only served if appropriate which will benefit older devices in particular which have satisfactory fidelity if the images are lower resolution. **Instructions - ** To test this functionality manually change the screen resolution so that the height is below the 800px threshold.

![alt text](reverseProxy.gif)

** ServerDownLoadBalancerSW **
This demonstration showcases the service workers ability to not only intercept requests, but persist requests independent of the state of the webpage or server which hosts the network resources. You can simulate this behaviour by loading the local web page, turning off the local server and then selecting the button (which in the background tries to fetch a text file) which should activate the polling mechanism. To simulate the theoritical server coming back online, restart the local web server which the service worker should detect and then will make the original persisted request (hooray for service worker!).

** KeyWordSearchUseCase **

** StreamHeaderFooter **

** StreamJsonListRender **

# FAQ #
---
**Q:** What browsers are supported?

**A:** For scenario ImageReverseProxy & ServerDownLoadBalancerSW check out [THIS](http://caniuse.com/#search=service%20worker) website for information on the latest service worker support.

**B:** For scenarios KeyWordSearchUseCase, StreamHeaderFooter & StreamJsonListRender (which all use streaming + service worker)

* Chrome - 52
* Opera - 39
* Firefox - X
* Safari - X
* Edge/IE - X

# Examples Built With #
---
* Materialize 
* JavaScript (JQuery)
* HTML
* CSS

# The Future #
---
Publication of a blog investigating each of the five use cases presented here, with detailed performance metrics and exploration into the various benefits associated with scenario.

# Contact Information #
---
* appliedinnovation@kainos.com

* J.McDonald@kainos.com