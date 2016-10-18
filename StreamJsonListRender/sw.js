//Event fires when the service worker is installed
self.addEventListener('install', event => {

  //Header/footer + contents cached & css
  event.waitUntil(
    caches.open("streamCaches").then(cache => {
      return cache.addAll([
        'html/footer.html',
        'html/header.html',
        'images/loremipsum.png',
        'images/twitter.png',
        'images/facebook.png'
      ])
    })
  );

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

      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      var counter = 0;

      //Get Header/Footer from cache and html from network
      const startFetch = caches.match('http://localhost:8001/html/header.html');

      //do something with json here
      const contentFetch = fetch("data.sjson").catch(() => new Response("Failed, soz")); 
      
      const endFetch = caches.match('http://localhost:8001/html/footer.html');

      //Chain together responses from each section
      startFetch
        .then(response => pushStream(response.body, true))
        .then(() => contentFetch)
        .then(response => pushStream(response.body, false))
        .then(() => endFetch)
        .then(response => pushStream(response.body, true))
        .then(() => controller.close());

       //Takes a response stream as input
       function pushStream(stream, isHeaderFooter) {
        
        //Reader lets me get data from input stream
        const reader = stream.getReader();

        //handle the json data differently from the typical html 
        if(!isHeaderFooter){
          var buffer = '';
          var parsedHtml = '';

          //Call and return result of the read function
          return readJson(); 
        } else {
          return readHeaderFooter();
        }

        //Job is to get data from the current stream and queue it
        function readJson() {

          //Read each chunk as it arrives
          return reader.read().then(result => {

            if (result.done) {

              return;
            }

            //create a buffer from the strem chunk received
            buffer += decoder.decode(result.value, {stream:true});

            //continue until json chunk finished
            while (true) {

              //check if json new line is encountered
              const indexOfNewline = buffer.indexOf('\n');
              if (indexOfNewline == -1) break;

              //parse everything on the line
              var data = JSON.parse(buffer.slice(0, indexOfNewline));

              //build into html
              data =  '<tr><td>' + data["id"] + '</td><td>' + data["first_name"] + '</td><td>' + data["last_name"] + '</td><td>' + data["email"] + '</td></tr>'

              //keep count of json items received
              counter++;

              //encode for html streaming
              data = encoder.encode(data);

              //send to the browser
              controller.enqueue(data);
              
              //buffer starts at next line of the json left over
              buffer = buffer.slice(indexOfNewline + 1);
            }

            //then keep iterating
            return readJson();
          });
        }   

        //handles non json
        function readHeaderFooter() {
          //Read each chunk as it arrives
          return reader.read().then(result => {

            //quit if done
            if (result.done) return;

            //else queue the html chunk result
            controller.enqueue(result.value);

            //then keep iterating
            return readHeaderFooter();
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


