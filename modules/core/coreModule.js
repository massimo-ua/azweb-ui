(function(){
	'use strict'
	angular.module('azweb.core', ['ngClickCopy','azweb.core.controllers']);
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
  			params: {
  				page: 1
  			},
  			templateUrl: 'modules/core/views/view-invite.html',
  			controller: 'viewInviteController'
  		})
  		.state('viewInvitesList', {
  			url: '/view-invites-list',
  			params: {
  				page: 1
  			},
  			templateUrl: 'modules/core/views/view-invites-list.html',
  			controller: 'viewInvitesListController',
  			data: {requiredLogin: true}
  		})
      .state('sendAccount', {
        url: '/send-account',
        templateUrl: 'modules/core/views/send-account.html',
        controller: 'sendAccountController',
        data: {requiredLogin: true}
      })
      .state('accStatistics', {
        url: '/acc-statistics',
        params: {
          page: 1
        },
        templateUrl: 'modules/core/views/statistics.html',
        controller: 'accStatController',
        data: {requiredLogin: true}
      })
      .state('sendBroadcast', {
        url: '/send-broadcast',
        templateUrl: 'modules/core/views/send-broadcast.html',
        controller: 'SendBroadCastController',
        controllerAs: 'sbc',
        data: {requiredLogin: true}
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'modules/core/views/settings.html',
        controller: 'SettingsController',
        controllerAs: 'vm',
        data: {requiredLogin: true}
      });
  		$urlRouterProvider.otherwise('/coupons');
}]);


}());