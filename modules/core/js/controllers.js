(function(){
	angular.module('azweb.core.controllers', []);
		/* controller functions definition */
		var couponsListController = function($scope, $stateParams, couponService, toastr) {
			$scope.coupons = {};
			$scope.paginationEnabled = false;
			$scope.type = $stateParams.type;
			$scope.paginationWindow = 5;
			$scope.loadCoupons = function(type, page) {
				if($scope.coupons.pagination != undefined && $scope.coupons.pagination.page == page) {
					return;
				}
				couponService.getCoupons(type, page)
					.then(function(response){
						if(response.data.data.length == 0) {
							toastr.error('Не найдено ни одной записи соответствующей запросу', 'Данных не найдено!');
							$scope.paginationEnabled = false;
						}
						$scope.coupons.data = response.data.data;
						if(response.data.pagination.total_pages > 1) {
							$scope.paginationEnabled = true;
							$scope.coupons.pagination = response.data.pagination;
						} 
					},
					function(response){
						console.log(response);
						toastr.error('Произошла ошибка во время загрузки данных', 'Ошибка получения данных');
					});
			}
			$scope.loadCoupons($stateParams.type, $stateParams.page);
			$scope.paginationEnd = function(page) {
				return page <= $scope.paginationWindow ? $scope.paginationWindow * 2 : page + $scope.paginationWindow;
			}
			$scope.paginationStart = function(page) {
				return page <= $scope.paginationWindow ? 1 : page - $scope.paginationWindow;
			}
			$scope.use = function(index) {
				couponService.useCoupon($scope.coupons.data[index].id)
					.then(function(response){
						toastr.info('Аккаунт успешно сохранен!', 'Информация');
						$scope.coupons.data.splice(index,1);
					},function(response){
						console.log(response);
						toastr.error('Во время сохранения аккаунта произошла ошибка', 'Изенения не были сохранены!');
					});
			}

		}

		var sendInviteController = function($scope, couponService, toastr) {
			$scope.nominals = {};
			$scope.formDisabled = false;
			$scope.buttonText = 'Отправить';
			$scope.inviteForm = {};
			$scope.invite={};
			couponService.getNominals()
			.then(function(response){
				if(response.data.data.length == 0) {
					toastr.error('Не найдено ни одного купона пригодного для отправки', 'Данных не найдено!');
					$scope.formDisabled = true;
				}
				//if(response.data.data.length == 1) {
				//	$scope.inviteForm.nominal = response.data.data[0].nominal;
				//}
				$scope.nominals = response.data.data;
			},
			function(response){
				console.log(response);
				toastr.error('Во время загрузки перечня доступных номиналов произошла ошибка', 'Ошибка загрузки данных!');
			});
			$scope.invite = function() {
				$scope.buttonText = 'Отправляем ...';
				console.log($scope.inviteForm);
				$scope.invite.duedate = $scope.invite.duedate ? new Date($scope.invite.duedate) : undefined;
				couponService.invite($scope.invite)
				.then(function(response){
					toastr.info('Приглашение успешно отправлено!', 'Информация');
					$scope.inviteForm = {};
					$scope.invite={};
				},function(response){
					console.log(response);
					toastr.error('Во время отправки приглашения произошла ошибка', 'Ошибка отправки приглашения!');
				})
				.finally(function(){
					$scope.buttonText = 'Отправить';
				});
			}

		}
		/* dsependencies injection block */
		couponsListController.$inject = ['$scope', '$stateParams', 'couponService', 'toastr'];
		sendInviteController.$inject = ['$scope', 'couponService', 'toastr'];
		/* controllers definition */
		angular.module('azweb.core.controllers')
		.controller('couponsListController', couponsListController)
		.controller('sendInviteController', sendInviteController);
}());