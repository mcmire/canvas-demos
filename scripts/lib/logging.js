var LOGGING = true;

function log(msg) {
  if (LOGGING) console.log(msg);
}

function clearDebug() {
  $('#debug').html("");
}

function debug(msg) {
  if ($('#debug').css('display') == "none") return;
  $('#debug').html($('#debug').html() + "<p>"+msg+"</p>");
}