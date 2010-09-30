var LOGGING = true;

function log(msg) {
  if (LOGGING) console.log(msg);
}

function clearDebug() {
  $('#debug').html("");
}

function debug(msg) {
  return;
  $('#debug').html($('#debug').html() + "<p>"+msg+"</p>");
}