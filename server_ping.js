// server_ping.js
// by Ryan Cohen

var PORT = '80'
var HOST = '69.120.129.64:' + PORT;

// TODO: Add endpoints

function pingServer(host, port) {
  $.ajax({
    url: host,
      success: function(result){
        alert('reply');
        // document.getElementById('id').innerHTML = '';
      },
      error: function(result){
        alert('timeout/error');
      }
  });
}

pingServer(HOST, PORT); // => update page
