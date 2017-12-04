'use strict';

module.exports = function () {
    console.log ('lorem');
    var show = function(){$('.closed').toggleClass('opened')};
    window.onload =  function(){ setTimeout( function(){ show();},500) };
}
