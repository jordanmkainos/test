//Event fires when the service worker is installed
self.addEventListener('install', event => {

  //Header/footer + cotents cached & css
  event.waitUntil(
    caches.open("streamCachesKainos").then(cache => {
      return cache.addAll([
        'html/footer.html',
        'html/header.html',
        'images/8.png',
        'images/13.png',
        'images/14.png',
        'js/1.js',
        'js/2.js',
        'js/2.js',
        'js/3.js',
        'js/4.js',
        'images/12.png',
        'images/15.png',
        'css/1.css',
        'css/2.css',
        'css/3.css',
        'css/4.css',
        'css/5.css',
        'css/6.css',
      ])
    })
  );

  //New service worker will skep waiting and activate
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
      if (requestURL.pathname == '/') {
          event.respondWith(streamPage(event.request));
      } else { //Just get resources from cache - css etc
          event.respondWith(
              caches.match(event.request).then(function (response) {

                  //If resource is in cache serve it || nake network request
                  return response || fetch(event.request);
              })
          );
      }
  }
});

//Builds up the web page using cached header, footer + network content
function streamPage(request){
  
  //Feature Check for stream support
  try {
    new ReadableStream({});
  }
  catch(e) {
    return new Response("Streams not supported");
  }

  //Create the response stream manually
  const stream = new ReadableStream({

    //This sets up the stream state when created
    start(controller) {

      //Get Header/Footer from cache and html from network
      const startFetch = caches.match('http://localhost:8002/html/header.html');
      const contentFetch = fetch("html/content.html").catch(() => new Response("Failed, soz"));      
      const endFetch = caches.match('http://localhost:8002/html/footer.html');

      //Chain together responses from each section
      startFetch
        .then(response => pushStream(response.body))
        .then(() => contentFetch)
        .then(response => pushStream(response.body))
        .then(() => endFetch)
        .then(response => pushStream(response.body))
        .then(() => controller.close());

       //Takes a response stream as input
       function pushStream(stream) {
        
        //Reader lets me get data from input stream
        const reader = stream.getReader();

        //Call and return result of the read function
        return read();

        //Job is to get data from the current stream and queue it
        function read() {

          //Read each chunk as it arrives
          return reader.read().then(result => {

            //quit if done
            if (result.done) return;

            //else queue the html chunk result
            controller.enqueue(result.value);

            //then keep iterating
            return read();
          });
        }        
      }
    }
  });

  //Return the stream as HTML
  return new Response(stream, {
    headers: {'Content-Type': 'text/html'}
  })  
}