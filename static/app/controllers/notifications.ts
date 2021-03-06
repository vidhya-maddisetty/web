import {Api} from '../services/api';
import {UniqList} from '../models/core';
import {Timestamp} from '../models/timestamp';

export interface INotificationContact{
	value: string;
	type: string;
}

export interface INotification {
	contact: INotificationContact;
	throttled: boolean;
	send_fail: number;
	timestamp: number;
}

export class Notification {
	throttled: boolean;
	timestamp: Timestamp;
	send_fail: number;
	contact: INotificationContact;
	
	constructor(public json: string){
		var notification = <INotification>JSON.parse(json);
		this.timestamp = new Timestamp(notification.timestamp);
		this.send_fail = notification.send_fail;
		this.throttled = notification.throttled;
		this.contact = notification.contact;
	}
}

export interface INotificationsScope extends ng.IScope {
	total: number;
	list: UniqList<Notification>;
}

export class NotificationsController {

	static $inject = ['$scope', 'api'];

	constructor(private $scope: INotificationsScope, private api: Api) {
		api.config().then((config) => {
			return api.notification.list()
				.then((data) => {
					$scope.total = data.total;
					$scope.list = new UniqList<Notification>([]);
					angular.forEach(data.list, (json) => {
						$scope.list.push(new Notification(json));
					});
				});
		});
	}
	
	remove(notification: Notification){
		this.api.notification.remove(notification.json).then((data) => {
			if(data.result > 0){
				this.$scope.list.remove(notification);
			}
		});
	}
}
