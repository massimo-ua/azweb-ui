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
				var end = page <= $scope.paginationWindow ? $scope.paginationWindow * 2 : page + $scope.paginationWindow;
				if($scope.coupons.pagination) {
					end = end <= $scope.coupons.pagination.total_pages ? end : $scope.coupons.pagination.total_pages;
				}
				return end;
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
			$scope.req={};
			$scope.duedate = undefined;

			function init() {
				couponService.getNominals()
					.then(function(response){
						if(response.data.data.length == 0) {
							toastr.error('Не найдено ни одного купона пригодного для отправки', 'Данных не найдено!');
							$scope.formDisabled = true;
						}
						$scope.nominals = response.data.data;
						},
						function(response){
							console.log(response);
							toastr.error('Во время загрузки перечня доступных номиналов произошла ошибка', 'Ошибка загрузки данных!');
					});
			};
			init();
			$scope.$watch('duedate',function(newValue, oldValue){
				if(newValue != oldValue && newValue != undefined && $scope.req.nominal != undefined) {
					var date = new Date(newValue+" UTC");
					couponService.getNominals(date)
						.then(function(response){
							console.log(response);
							$scope.nominals = response.data.data;
							toastr.info('Количество купонов успешно обновлено!', 'Информация');
						},
						function(err){
							console.log(err);
							if(err.status == 404) {
								toastr.error('По заданым условиям купоны отсутствуют', 'Ошибка!');
							}
							else {
								toastr.error('Во время обновления произошла ошибка', 'Ошибка!');
							}
						})
				}
			});
			$scope.invite = function() {
				$scope.buttonText = 'Отправляем ...';
				$scope.req.duedate = $scope.duedate ? new Date($scope.duedate+" UTC") : undefined;
				couponService.invite($scope.req)
				.then(function(response){
					console.log(response)
					toastr.info('Код: ' + response.data.uuid , 'Приглашение успешно отправлено!');
					$scope.inviteForm = {};
					$scope.req={};
				},function(err){
					console.log(err);
					toastr.error('Во время отправки приглашения произошла ошибка', 'Ошибка отправки приглашения!');
				})
				.finally(function(){
					$scope.buttonText = 'Отправить';
				});
			}

		}
		var viewInviteController = function($scope, $stateParams, couponService, toastr) {
			$scope.a = {};
		}
		/* dsependencies injection block */
		couponsListController.$inject = ['$scope', '$stateParams', 'couponService', 'toastr'];
		sendInviteController.$inject = ['$scope', 'couponService', 'toastr'];
		viewInviteController.$inject = ['$scope', '$stateParams', 'couponService', 'toastr'];
		/* controllers definition */
		angular.module('azweb.core.controllers')
		.controller('couponsListController', couponsListController)
		.controller('sendInviteController', sendInviteController)
		.controller('viewInviteController', viewInviteController);
}());