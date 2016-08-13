(function(){
	angular.module('azweb.core.controllers', []);
		/* controller functions definition */
		var couponsListController = function($scope, $stateParams, couponService, paginationService, toastr) {
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
						}
						$scope.coupons.pagination = response.data.pagination; 
					},
					function(response){
						console.log(response);
						toastr.error('Произошла ошибка во время загрузки данных', 'Ошибка получения данных');
					});
			}
			$scope.loadCoupons($stateParams.type, $stateParams.page);
			$scope.paginationEnd = function(page, total) {
				return paginationService.paginationEnd(page, $scope.paginationWindow, total);
			}
			$scope.paginationStart = function(page) {
				return paginationService.paginationStart(page, $scope.paginationWindow);
			}
			$scope.use = function(index) {
				couponService.useCoupon($scope.coupons.data[index].id)
					.then(function(response){
						toastr.info('Аккаунт успешно сохранен!', 'Информация');
						$scope.coupons.data.splice(index,1);
					},function(err){
						console.log(err);
						toastr.error('Во время сохранения аккаунта произошла ошибка', 'Изенения не были сохранены!');
					});
			}

		}

		var sendInviteController = function($scope, $state, couponService, toastr) {

			function init() {
				$scope.nominals = {};
				$scope.formDisabled = false;
				$scope.buttonText = 'Отправить';
				$scope.inviteForm = {};
				$scope.req={};
				$scope.minDueDate = new Date(new Date() - 86400000);
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
			$scope.refreshAmount = function () {
				if($scope.req.nominal != undefined) {
					var date = new Date($scope.req.duedate);
					couponService.getNominals(date)
						.then(function(response){
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
			};
			$scope.invite = function() {
				$scope.buttonText = 'Отправляем ...';
				$scope.req.duedate = $scope.req.duedate ? new Date($scope.req.duedate) : undefined;
				couponService.invite($scope.req)
				.then(function(response){
					toastr.info('Код: ' + response.data.uuid , 'Приглашение успешно отправлено!');
					$state.reload();
				},function(err){
					console.log(err);
					toastr.error('Во время отправки приглашения произошла ошибка', 'Ошибка отправки приглашения!');
				})
				.finally(function(){
					$scope.buttonText = 'Отправить';
				});
			}

		}
		var viewInviteController = function($scope, $stateParams, couponService, paginationService, toastr) {
			$scope.coupons = {};
			$scope.loadCoupons = function(uuid, page) {
				if(uuid == undefined) {
					return;
				}
				couponService.getInvitationCouponsList(uuid, page)
					.then(function(response){
						if(response.data.data.length == 0) {
							toastr.error('Не найдено ни одной записи соответствующей запросу', 'Данных не найдено!');
							$scope.paginationEnabled = false;
						}
						else {
							$scope.coupons.data = response.data.data;
						}
						if(response.data.pagination.total_pages > 1) {
							$scope.paginationEnabled = true;
						}
						$scope.coupons.pagination = response.data.pagination; 
					}, function(err){
						console.log(err);
						toastr.error('Произошла ошибка во время загрузки данных', 'Ошибка получения данных');
					});
			}
			$scope.loadCoupons($stateParams.uuid, $stateParams.page);
			$scope.paginationEnd = function(page, total) {
				return paginationService.paginationEnd(page, $scope.paginationWindow, total);
			}
			$scope.paginationStart = function(page) {
				return paginationService.paginationStart(page, $scope.paginationWindow);
			}
		}
		var viewInvitesListController = function($scope, $stateParams, couponService, paginationService, toastr) {
			$scope.coupons = {};
			$scope.loadCoupons = function(page) {
				couponService.getInvitations(page)
				.then(function(response){
						if(response.data.data.length == 0) {
							toastr.error('Не найдено ни одной записи соответствующей запросу', 'Данных не найдено!');
							$scope.paginationEnabled = false;
						}
						else {
							$scope.coupons.data = response.data.data;
						}
						if(response.data.pagination.total_pages > 1) {
							$scope.paginationEnabled = true;
						}
						$scope.coupons.pagination = response.data.pagination;  
					},
					function(err){
						console.log(err);
						toastr.error('Произошла ошибка во время загрузки данных', 'Ошибка получения данных');
					});
			}
			$scope.loadCoupons($stateParams.page);
		}
		/* dsependencies injection block */
		couponsListController.$inject = ['$scope', '$stateParams', 'couponService', 'paginationService', 'toastr'];
		sendInviteController.$inject = ['$scope', '$state', 'couponService', 'toastr'];
		viewInviteController.$inject = ['$scope', '$stateParams', 'couponService', 'paginationService', 'toastr'];
		viewInvitesListController.$inject = ['$scope', '$stateParams', 'couponService', 'paginationService', 'toastr'];
		/* controllers definition */
		angular.module('azweb.core.controllers')
		.controller('couponsListController', couponsListController)
		.controller('sendInviteController', sendInviteController)
		.controller('viewInviteController', viewInviteController)
		.controller('viewInvitesListController', viewInvitesListController);
}());