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

		var sendInviteController = function($scope, $state, couponService, toastr, ngCopy) {
			function init() {
				$scope.nominals = {};
				$scope.statEnabled = false;
				$scope.buttonText = 'Отправить';
				$scope.inviteForm = {};
				$scope.req={};
				$scope.minDueDate = new Date(); /*- 86400000);*/
				$scope.maxDueDate = new Date($scope.minDueDate + 432000000);
				$scope.disabledDates = [];
				/*couponService.getMaxDueDate()
					.then(function(response){
						$scope.maxDueDate = new Date(response.data.maxduedate + 86400000);
					}, function(data, status, headers, config){
						console.log(data.error + ' ' + status);
					});*/
				couponService.getNominals()
					.then(function(response){
						if(response.data.data.length == 0) {
							toastr.error('Не найдено ни одного купона пригодного для отправки', 'Данных не найдено!');
						}
						$scope.nominals = response.data.data;
						$scope.statEnabled = true;
						},
						function(response){
							console.log(response);
							//toastr.error('Во время загрузки перечня доступных номиналов произошла ошибка', 'Ошибка загрузки данных!');
					});
					updateAccountsAmount();
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
					var link = "http://198.96.90.154:10102/#/view-invite/" + response.data.uuid;
					ngCopy(link);
					toastr.info('Код: ' + response.data.uuid, 'Приглашение успешно отправлено!');
					$state.reload();
				},function(err){
					console.log(err);
					toastr.error('Во время отправки приглашения произошла ошибка', 'Ошибка отправки приглашения!');
				})
				.finally(function(){
					$scope.buttonText = 'Отправить';
					updateAccountsAmount();
				});
			}
			function updateAccountsAmount() {
				couponService.getActiveCouponsAmount()
					.then(function(response){
						$scope.activeCouponsAmount = response.data.activeCouponsAmount;
						$scope.minDueDate = new Date($scope.activeCouponsAmount[0].duedate - 86400000);
						$scope.maxDueDate = new Date($scope.activeCouponsAmount[$scope.activeCouponsAmount.length-1].duedate);			
						$scope.disabledDates = listDisabledDates($scope.activeCouponsAmount);
					}, function(data, status, headers, config){
						console.log(data.error + ' ' + status);
					});
			}
			function listDisabledDates(activeDates) {
						var current = null;
						var prev = null;
						var disabledDates = [];
						for(i=0;i<activeDates.length;i++){
							prev = current;
							current = new Date(activeDates[i].duedate);
							if(prev != null) {
								var diff = Math.floor((current - prev) / 86400000);
								if(diff > 1) {
									for(d=1;d<=diff;d++) {
										var emptyDate = new Date(prev);
										emptyDate.setDate(emptyDate.getDate() + d);
										disabledDates.push(dateToStr(emptyDate));
									}
								}
							}

						}
						return disabledDates;
			}
			function dateToStr(date) {
				function pad(s) { return (s < 10) ? '0' + s : s; };
				return [date.getFullYear(), pad(date.getMonth()+1), pad(date.getDate())].join('-');
			}

		}
		var viewInviteController = function($scope, $stateParams, couponService, paginationService, toastr) {
			$scope.coupons = {};
			$scope.paginationEnabled = false;
			$scope.paginationWindow = 5;
			$scope.loadCoupons = function(type, page) {
				couponService.getInvitationCouponsList($stateParams.uuid, page)
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
			$scope.loadCoupons(null, $stateParams.page);
			$scope.paginationEnd = function(page, total) {
				return paginationService.paginationEnd(page, $scope.paginationWindow, total);
			}
			$scope.paginationStart = function(page) {
				return paginationService.paginationStart(page, $scope.paginationWindow);
			}
		}
		var viewInvitesListController = function($scope, $stateParams, couponService, paginationService, toastr) {
			$scope.coupons = {};
			$scope.paginationEnabled = false;
			$scope.paginationWindow = 5;
			$scope.loadCoupons = function(type, page) {
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
			$scope.loadCoupons(null, $stateParams.page);
			$scope.paginationEnd = function(page, total) {
				return paginationService.paginationEnd(page, $scope.paginationWindow, total);
			}
			$scope.paginationStart = function(page) {
				return paginationService.paginationStart(page, $scope.paginationWindow);
			}
		}
		/* dsependencies injection block */
		couponsListController.$inject = ['$scope', '$stateParams', 'couponService', 'paginationService', 'toastr'];
		sendInviteController.$inject = ['$scope', '$state', 'couponService', 'toastr', 'ngCopy'];
		viewInviteController.$inject = ['$scope', '$stateParams', 'couponService', 'paginationService', 'toastr'];
		viewInvitesListController.$inject = ['$scope', '$stateParams', 'couponService', 'paginationService', 'toastr'];
		/* controllers definition */
		angular.module('azweb.core.controllers')
		.controller('couponsListController', couponsListController)
		.controller('sendInviteController', sendInviteController)
		.controller('viewInviteController', viewInviteController)
		.controller('viewInvitesListController', viewInvitesListController);
}());