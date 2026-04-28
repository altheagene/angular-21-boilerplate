import { ɵinjectChangeDetectorRef, Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationStart } from "@angular/router";
import { Subscription } from "rxjs";

import { Alert, AlertType } from '@app/_models';
import { AlertService } from '@app/_services';

@Component({selector: 'alert', templateUrl: 'alert.component.html', standalone: false})
export class AlertComponent implements OnInit, OnDestroy {
    private scheduleDetectChanges(){
        setTimeout(() => this.cdr.detectChanges());
    }

    @Input() id = 'default-alert';
    @Input() fade = true;

    alerts: Alert[] = [];
    alertSubscription!: Subscription;
    routeSubscription!: Subscription;

    constructor(
        private router: Router,
        private alertService: AlertService,
        private cdr: ChangeDetectorRef
    ){}

    ngOnInit() {
        //subscribe to new alert notifications
        this.alertSubscription = this.alertService.onAlert(this.id)
            .subscribe(alert => {
                //clear alerts when an empty alert is received
                if(!alert.message){
                    this.alerts = this.alerts.filter(x => x.keepAfterRouteChange);
                    this.alerts.forEach(x => delete x.keepAfterRouteChange);
                    this.scheduleDetectChanges();
                    return;
                }

                this.alerts.push(alert);
                this.scheduleDetectChanges();

                if(alert.autoClose){
                    setTimeout(() => this.removeAlert(alert), 3000)
                }
            })
    }
}