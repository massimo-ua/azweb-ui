(function(){
	'use strict'
	angular.module('azweb.core', ['azweb.core.controllers']);
	angular.module('azweb.core').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  		$stateProvider
  		.state('coupons', {
    			url: '/coupons',
    			params: {
            		type: 'actual',
            		page: 1
        		},
    			templateUrl: 'modules/core/views/list.html',
    			controller: 'couponsListController',
    			data: {requiredLogin: true}
  		})
  		.state('sendInvite', {
  			url: '/send-invite',
  			templateUrl: 'modules/core/views/send-invite.html',
  			controller: 'sendInviteController',
  			data: {requiredLogin: true}
  		})
  		.state('viewInvite', {
  			url: '/view-invite/:uuid',
  			templateUrl: 'modules/core/views/view-invite.html',
  			controller: 'viewInviteController'
  		});
  		$urlRouterProvider.otherwise('/coupons');
}]);


}());