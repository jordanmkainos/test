var isDown = false;
var originalRequest;

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

    //stop caching - ensures the cached verison isnt used when making request to poll
    var myHeaders = new Headers();
    myHeaders.append('pragma', 'no-cache');
    myHeaders.append('cache-control', 'no-cache');

    //Gets the request url 
    var requestURL = new URL(event.request.url);

    //catch the root requests
    if (requestURL.origin == location.origin) {

        event.respondWith(
            fetch(event.request, myHeaders).then(function (response) {

                send_message_to_all_clients("<div class='row'><div class='card horizontal blue-grey darken-1 white-text'><div class='card-content'><h5>Successfully Retrieved the file!</h5></div><div class='card-image valign-wrapper'><i class='medium material-icons valign icon-white'>done</i></div></div</div>");

                //the request worked so return it!
                return response;
            }).catch(function (err) {

                var myResponse = new Response();

                //If the server is down clone the original request
                originalRequest = event.request.clone();

                send_message_to_all_clients("<div class='row'><div class='card horizontal blue-grey darken-1 white-text'><div class='card-content'><h5>The request is saved and will be submitted when the server is ready</h5></div><div class='card-image valign-wrapper'><i class='medium material-icons valign icon-white'>call_received</i></div></div</div>");

                //avoid constant polling by adding a variable delay
                setTimeout(function () {
                    pollServer(event.request);
                }, Math.floor((Math.random() * 4000) + 1000));

                return myResponse;
            })
        );
    }
});

//This function will continue to poll the server to determine its status
function pollServer(request) {

  //make request - with fake data to test end point
  fetch("dummyRequests/ticket.txt?" + new Date()).then(function (response) {

    send_message_to_all_clients("<div class='row'><div class='card horizontal blue-grey darken-1 white-text'><div class='card-content'><h5>The Server is back!</h5></div><div class='card-image valign-wrapper'><i class='medium material-icons valign icon-white'>done</i></div></div</div>");

    //Abitrary number - in real world server logic would specefiy this in response
    var ticketNumber = 3000;

    //wait as told - then make original request
    setTimeout(function() {

       fetch(originalRequest);

    }, ticketNumber);

    return response;

 }).catch(function (err) { //if the server is still down

      send_message_to_all_clients("<div class='row'><div class='card horizontal red accent-3 white-text'><div class='card-content'><h5>Polling for server status...</h5></div><div class='card-image valign-wrapper'><i class='medium material-icons valign icon-white'>loop</i></div></div</div>");

      setTimeout(function() {
          pollServer(request);
      }, Math.floor((Math.random() * 4000) + 1000))
  });

}

//Gets all the service worker clients and sends the message to each (ideally only send to the original request page)
function send_message_to_all_clients(msg){
    clients.matchAll().then(clients => {
        clients.forEach(client => {
            send_message_to_client(client, msg).then(m => console.log("SW Received Message: "+m));
        })
    })
}

//UsesSW functionality to send a message to the specified client
function send_message_to_client(client, msg){
    return new Promise(function(resolve, reject){
        var msg_chan = new MessageChannel();

        msg_chan.port1.onmessage = function(event){
            if(event.data.error){
                reject(event.data.error);
            }else{
                resolve(event.data);
            }
        };

        client.postMessage(msg, [msg_chan.port2]);
    });
}
