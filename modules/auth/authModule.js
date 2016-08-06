(function(){

angular.module('azweb.auth',['azweb.auth.controllers'])
.config(['$stateProvider', function($stateProvider) {
  $stateProvider
  .state('authLogin', {
    url: '/auth/login',
    controller: 'AuthLoginController',
    templateUrl: 'modules/auth/views/login.html'
  })
}]);

}());