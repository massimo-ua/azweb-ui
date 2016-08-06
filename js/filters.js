(function(){
	'use strict'
	angular.module('azweb.filters',[]);
	angular.module('azweb.filters').filter('range', function(){
  				return function(input, total, start) {
    				var start = start === undefined ? 1 : parseInt(start);
    				total = parseInt(total);
    				if(start <= 0) start = 1;
    				if(start >= total) {
    					return input;
    				}
    				for(var i=start; i<=total; i++) {
      					input.push(i);
    				}
    				return input;
  				}
			});

}());