
var turboFlag = true;
var screenWidth = 0;
var screenHeight = 0;

//Event fires when the service worker is installed
self.addEventListener('install', event => {

  //New service worker will skip waiting and activate
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  //Lets service worker take control of the page
  clients.claim();
});

//Intercepts any request from the web page
self.addEventListener('fetch', event => {

  //Gets the request url 
  var requestURL = new URL(event.request.url);

  //catch the root requests
  if (requestURL.origin == location.origin) {

    //If Root request build up the page html
    if (requestURL.pathname.includes(".jpg") || requestURL.pathname.includes(".png")) {
      event.respondWith(returnWebpOrOriginal(event.request, requestURL.pathname.includes(".jpg")));
    } else { //Just get resources from cache - css etc
        event.respondWith(
          caches.match(event.request).then(function (response) {

            //If resource is in cache serve it || make network request
            return response || fetch(event.request);
          })
        );
    }
  }
});

//logic that controls whether WebP is served
function returnWebpOrOriginal(request, isJpeg) {

  var url = request.url;

  //if lower than (arbitrary in this case) threshold show lower res version
  if(screenHeight < 801 && screenHeight != 0){
      
      index = url.length -4;

      //append the -low before the file extension
      url = url.substr(0, index) + "-low" + url.substr(index);
  }

  //check is the browser supports webp format
  let supportsWebp = false;
  if (request.headers.has('accept')) {
    supportsWebp = request.headers.get('accept').includes('webp');
  }

  //allows manula override to never show webP (for testing)
  if(!turboFlag){
    supportsWebp = false;
  }

  if (supportsWebp) {

    // If we support webp then adjust the URL to ask for the webp file
    if (isJpeg) {
       url = url.replace("jpg", "webp");
    } else {
       url = url.replace("png", "webp");
    }

    // Then use fetch to return the webp file
    return fetch(url).then(function(response) {
      // If not all the images have been converted then we fallback to requesting the original file.
      return response.status === 404 ? fetch(request) : response;
    });
  } else {
    // If the browser doesn't support webp, just fetch the original request.
    return fetch(url);
  }
}

//takes input from the client - such as screen resolution + image state to show
self.addEventListener('message', function(event){

  if(event.data[0]) {
    turboFlag = event.data[1]; //used as an override to show default images by force (you maniac)
  } else {
    screenHeight = event.data[1];
    screenWidth = event.data[2];
  }
});
