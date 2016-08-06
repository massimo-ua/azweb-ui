(function(){

'use strict'
angular.module('azweb.auth.controllers', [])
.controller('AuthLoginController', ['$scope', '$state', 'authService', 'toastr', function($scope, $state, authService, toastr) {
	$scope.buttonText = 'Логин';
	$scope.login = function() {
		$scope.buttonText = 'Авторизация ...'
		authService.login($scope.auth.email, $scope.auth.password)
		.then(function(response){
			//if login succesful emit broadcast message for changes in profile menu
			toastr.info('Авторизация произведена успешно!', 'Информация');
			$scope.$emit('USER_LOGIN_EVENT');
			$state.go('coupons');
		})
		.catch(function(response){
				console.log(response);
				toastr.error(response.data.message, 'Ошибка авторизации');
		})
		.finally(function(){
			$scope.buttonText = 'Логин';
		});
	}
	$scope.logout = function() {
		authService.logout().then(function(response){
			toastr.info('Выход выполнен успешно!', 'Информация');
			$scope.$emit('USER_LOGOUT_EVENT');
			$state.go('authLogin');
		});
	}
}]);

}());