console.log ('e');

var fn = function(){$('.closed-band').toggleClass('opened-band')};
window.onload =  function(){ setInterval( function(){ fn();window.onload() },1000) };