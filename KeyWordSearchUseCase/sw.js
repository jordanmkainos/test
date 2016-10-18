//Event fires when the service worker is installed
self.addEventListener('install', event => {

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
        event.respondWith(search());
        return
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

//handles search logic
function search() {

  //creates a stream
  const stream = new ReadableStream({

    //on stream start/creation
    start: controller => {

      //What we want to find
      var searchTerm = "service workers";

      //Chars to show either side of the result in the match - ie not just the search term
      var contextBefore = 30;
      var contextAfter = 30;

      //Converts result and search term to lower case
      var caseInsensitive = true;

      //What we want to fetch
      var url = 'https://html.spec.whatwg.org/';

      console.log(`Searching '${url}' for '${searchTerm}'`);

      //Perform request on url
      fetch(url).then(response => {

        //Decode the html to text 
        var decoder = new TextDecoder();

        //read chunk data
        var reader = response.body.getReader();

        //convert to lower case
        var toMatch = caseInsensitive ? searchTerm.toLowerCase() : searchTerm;

        //get size of buffer incase of overlap in chunks
        var bufferSize = Math.max(toMatch.length - 1, contextBefore);

        //init search vars
        var bytesReceived = 0;
        var buffer = '';
        var matchFoundAt = -1;

        //read chunk and pass response in process function
        return reader.read().then(function process(result) {

          if (result.done) {
            console.log('Failed to find match');
            return;
          }

          //add each character to the stream queue
          controller.enqueue(result.value);

          //Update total bytes
          bytesReceived += result.value.length;
          console.log(`Received ${bytesReceived} bytes of data so far`);

          //convert chunk to text
          buffer += decoder.decode(result.value, { stream: true });

          // already found match & just context-gathering?
          if (matchFoundAt === -1) {
            matchFoundAt = (caseInsensitive ? buffer.toLowerCase() : buffer).indexOf(toMatch);
          }

          //If not found, trim chunk to the required buffer size
          if (matchFoundAt === -1) {
            buffer = buffer.slice(-bufferSize);
          }
          else if (buffer.slice(matchFoundAt + toMatch.length).length >= contextAfter) {
            console.log("Here's the match:")
            console.log(buffer.slice(
              Math.max(0, matchFoundAt - contextBefore),
              matchFoundAt + toMatch.length + contextAfter
            ));
            console.log("Cancelling fetch");
            reader.cancel();
            controller.close();
            return;
          }
          else {
            console.log('Found match, but need more context…');
          }

          //Keep reading
          return reader.read().then(process);

        });
      }).catch(err => {
        console.log("Something went wrong. See devtools for details. Does the response lack CORS headers?");
        throw err;
      });

    }
  });

  //once stream queue has been populated send data
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/html'
    }
  });

}

