(function(){
angular.module('azweb',[
		'ngResource',
		'ui.router',
		'satellizer',
		'toastr',
		'azweb.services',
		'azweb.filters',
		'azweb.auth',
		'azweb.core'
	]);
angular.module('azweb').run(['$rootScope', '$state', 'authService', '$http', function($rootScope, $state, authService, $http) {
  authService.setStorageType('localStorage');
  $rootScope.$on('$stateChangeStart', function(event, toState){
  	if(authService.isAuthenticated()) {
      if(!$rootScope.userProfile) {
        $rootScope.userProfile = authService.profile();
      }
  	}
  	else {
  		if(toState.data && toState.data.requiredLogin) {
  			event.preventDefault();
  			$state.go('authLogin');
  		}
  	}
  });
  $rootScope.$on('USER_LOGIN_EVENT', function() {
  		$rootScope.userProfile = authService.profile(); 
  });
  $rootScope.$on('USER_LOGOUT_EVENT', function() {
  	$rootScope.userProfile = undefined;
  });

}]);
angular.module('azweb').config(['toastrConfig', function(toastrConfig){
	angular.extend(toastrConfig, {
		positionClass: 'toast-top-right',
		target: 'body'
	});
}]);
}());