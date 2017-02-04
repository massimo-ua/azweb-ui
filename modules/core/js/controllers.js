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
					var link = "http://198.96.90.123:10102/#/view-invite/" + response.data.uuid;
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
						$scope.disabledDates = couponService.listDisabledDates($scope.activeCouponsAmount);
					}, function(data, status, headers, config){
						console.log(data.error + ' ' + status);
					});
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
		var sendAccountController = function($scope, $state, couponService, toastr, ngCopy) {
			function init() {
				$scope.buttonText = 'Отправить';
				$scope.accountsAmount = undefined;
				$scope.activeAccountsAmount = [];
				updateAccountsAmount();
				$scope.req={};
			}
			init();
			function updateAccountsAmount() {
				couponService.getActiveAccountsAmount()
					.then(function(response){
						if(response.data.activeAccountsAmount.length > 0) {
							$scope.activeAccountsAmount = response.data.activeAccountsAmount;
							$scope.minDueDate = new Date(response.data.activeAccountsAmount[0].duedate);
							if(response.data.activeAccountsAmount.length > 1) {
								$scope.maxDueDate = new Date(response.data.activeAccountsAmount[response.data.activeAccountsAmount.length-1].duedate);
							} else {
								var date = new Date($scope.minDueDate);
								$scope.maxDueDate = new Date(date.setTime( date.getTime() + 86400000 ));
							}	
							$scope.disabledDates = couponService.listDisabledDates($scope.activeAccountsAmount);
						}
					}, function(data, status, headers, config){
						console.log(data.error + ' ' + status);
					});
			}
			$scope.invite = function() {
						$scope.buttonText = 'Отправляем ...';
						$scope.req.duedate = $scope.req.duedate ? new Date($scope.req.duedate) : undefined;
						couponService.sendAccounts($scope.req)
						.then(function(response){
							var link = "http://46.254.19.107:10102/#/view-invite/" + response.data.uuid;
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
			$scope.refreshAmount = function () {
				if($scope.req.duedate == undefined || $scope.activeAccountsAmount == undefined) return;
				$scope.accountsAmount = couponService.checkAccountsAmount($scope.req.duedate, $scope.activeAccountsAmount);
			};
		}
		var accStatController = function($scope, $stateParams, couponService, paginationService, toastr) {
			$scope.coupons = {};
			$scope.paginationEnabled = false;
			$scope.paginationWindow = 5;
			$scope.loadCoupons = function(type, page) {
				couponService.getStatistics(page)
				.then(function(response){
					if(response.data.data.length == 0) {
						toastr.error('Не найдено ни одной записи соответствующей запросу', 'Данных не найдено!');
						$scope.paginationEnabled = false;
					}
					else {
						$scope.coupons = response.data.data;
					}
					if(response.data.pagination.total_pages > 1) {
						$scope.paginationEnabled = true;
					}
					$scope.coupons.pagination = response.data.pagination;  
				},function(err){
					toastr.error('Во время загрузки статистики произошла ошибка', 'Ошибка загрузки статистики!');
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
		var SendBroadCastController = function(toastr, $log, couponService) {
			this.buttonText = "Отправить";
			this.saveMessage = function() {
				$log.debug(this);
				couponService.sendBroadCast(this.msg).then(function(response){
					$log.debug(response);
					toastr.info('Сообщение успешно поставлено в очередь для последующей обработки!','Сообщение отправлено');
				}, function(err){
					$log.error(err);
					toastr.error('Произошла ошибка во время постановки сообщения в очередь для последующей обработки!','Сообщение не отправлено!');
				});
				
			}
		}
		var SettingsController = function(mailManagerService, toastr, ngDialog, $scope, $log) {
			var vm = this;
			function init() {
				vm.withdeletion = undefined;
				vm.subjectParsers = [];
				vm.bodyParsers = [];
				vm.buttonText = "Сохранить";
				vm.goupTextHeader1 = "Настройки парсера заголовка сообщения";
				vm.goupTextHeader2 = "Настройки парсера тела сообщения";
				vm.goupTextHeader3 = "Общие настройки";
				vm.regexpLabel = "Парсер темы письма";
				vm.regexp2Label = "Парсер купона";
				vm.nominalLabel = "Номинал";
				vm.parserDueDateLabel = "Парсер Duedate",
				vm.formatDueDateLabel = "Формат Duedate"
				vm.toolsLabel = "Инструменты";
				vm.withdeletionOn = "Включено";
				vm.withdeletionOff = "Выключено";
				vm.withdeletionLabel = "Удаление писем";
				mailManagerService.getSubjectParser()
					.then(function(response){
						vm.subjectParsers = response;
					})
					.catch(function(err){
						$log.error(err);
					});
				mailManagerService.getBodyParser()
					.then(function(response){
						vm.bodyParsers = response;
					})
					.catch(function(err){
						$log.error(err);
					});
				mailManagerService.getEmailDeletion()
					.then(function(response){
						vm.withdeletion = response;
					})
					.catch(function(err){
						$log.error(err);
					});
			};
			init();
			vm.addSubjectParser = function(){
                var config = {
                    template: 'modules/core/views/subject-parser.html',
                    closeByDocument: true,
                    closeByEscape: true,
                    showClose: true,
                    controller: PopupController
                }
                ngDialog.openConfirm(config)
                	.then(function(input){
                		mailManagerService.saveSubjectParser(input)
                			.then(function(response){
                				toastr.info('Шаблон успешно сохранен');
                			})
                			.catch(function(err){
                				$log.error(err);
                				toastr.error('Произошла ошибка при сохранении шаблона');
                			});
                		vm.subjectParsers.push(input);
                	},
                	function(event){
                		$log.debug(event);
                		toastr.info('Парсер не был добавлен!');
                	});
                function PopupController($scope) {
                	function init() {
                		$scope.buttonText = "Сохранить";
                		$scope.fields = [{
                			name: 'regexp',
                			label: 'Парсер темы письма',
                			help: 'Введите регулярное выражение'
                		},{
                			name: 'nominal',
                			label: 'Код номинала (D - удаление)',
                			help: 'Введите код номинала'
                		}];
                		$scope.settings = {};
                	}
                	init();
                }
                PopupController.$inject = ['$scope'];
			}
			vm.addBodyParser = function(){
                var config = {
                    template: 'modules/core/views/subject-parser.html',
                    closeByDocument: true,
                    closeByEscape: true,
                    showClose: true,
                    controller: PopupController
                }
                ngDialog.openConfirm(config)
                	.then(function(input){
                		mailManagerService.saveBodyParser(input)
                			.then(function(response){
                				toastr.info('Шаблон успешно сохранен');
                			})
                			.catch(function(err){
                				$log.error(err);
                				toastr.error('Произошла ошибка при сохранении шаблона');
                			});
                		vm.bodyParsers.push(input);
                	},
                	function(event){
                		$log.debug(event);
                		toastr.info('Парсер не был добавлен!');
                	});
                function PopupController($scope) {
                	function init() {
                		$scope.fields = [{
                			name: 'regexp',
                			label: 'Парсер купона',
                			help: 'Введите регулярное выражение'
                		},{
                			name: 'due_date_parser',
                			label: 'Парсер Duedate',
                			help: 'Введите регулярное выражения для Duedate'
                		},{
                			name: 'due_date_format',
                			label: 'Формат Duedate (strptime)',
                			help: 'Введите формат даты для Duedate'
                		}];
                		$scope.buttonText = "Сохранить";
                		$scope.settings = {};
                	}
                	init();
                }
                PopupController.$inject = ['$scope'];
			}
			vm.toggleWithDeletion = function(){
				var value = (vm.withdeletion == undefined) ? true : !vm.withdeletion;  
				mailManagerService.saveEmailDeletion(value)
					.then(function(response){
						vm.withdeletion = value;
					})
					.catch(function(err){
						$log.error(err);
					});
			}
			vm.deleteSubjectParser = function(index) {
				if(index == undefined) return;
				mailManagerService.deleteSubjectParser(vm.subjectParsers[index].id)
					.then(function(response){
						vm.subjectParsers.splice(index,1);
					})
					.catch(function(err){
						$log.error(err);
					});
			}
			vm.deleteBodyParser = function(index) {
				if(index == undefined) return;
				$log.debug(index);
				$log.debug(vm.bodyParsers);
				mailManagerService.deleteBodyParser(vm.bodyParsers[index].id)
					.then(function(response){
						vm.bodyParsers.splice(index,1);
					})
					.catch(function(err){
						$log.error(err);
					});
			}
		}
		/* dsependencies injection block */
		couponsListController.$inject = ['$scope', '$stateParams', 'couponService', 'paginationService', 'toastr'];
		sendInviteController.$inject = ['$scope', '$state', 'couponService', 'toastr', 'ngCopy'];
		viewInviteController.$inject = ['$scope', '$stateParams', 'couponService', 'paginationService', 'toastr'];
		viewInvitesListController.$inject = ['$scope', '$stateParams', 'couponService', 'paginationService', 'toastr'];
		sendAccountController.$inject = ['$scope', '$state', 'couponService', 'toastr', 'ngCopy'];
		accStatController.$inject = ['$scope', '$stateParams', 'couponService', 'paginationService', 'toastr'];
		SendBroadCastController.$inject = ['toastr', '$log', 'couponService'];
		SettingsController.$inject = ['mailManagerService', 'toastr', 'ngDialog', '$scope', '$log'];
		/* controllers definition */
		angular.module('azweb.core.controllers')
		.controller('couponsListController', couponsListController)
		.controller('sendInviteController', sendInviteController)
		.controller('viewInviteController', viewInviteController)
		.controller('viewInvitesListController', viewInvitesListController)
		.controller('sendAccountController', sendAccountController)
		.controller('accStatController', accStatController)
		.controller('SendBroadCastController', SendBroadCastController)
		.controller('SettingsController', SettingsController);

}());