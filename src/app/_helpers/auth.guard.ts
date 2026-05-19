import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, GuardResult, MaybeAsync} from '@angular/router';
import { AccountService } from '@app/_services';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';


@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
        const account = this.accountService.accountValue;

        if (account) {
            //check if route is  restricyed by role

            if(route.data.roles && !route.data.roles.includes(account.role)) {
                //role not authorized so redirect to home page
                this.router.navigate(['/']);
                return false;
            }

            //authorized so return true
            return true;
        }

        return this.accountService.refreshToken().pipe(
            map(account => {
                if (route.data['roles'] && !route.data['roles'].includes(account.role)) {
                    this.router.navigate(['/']);
                    return false;
                }
                return true;
            }),
            catchError(() => {
                this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
                return of(false);
            })
        );
    }
}

// import { Injectable } from '@angular/core';
// import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
// import { Observable } from 'rxjs';
// import { map, catchError } from 'rxjs/operators';
// import { of } from 'rxjs';

// import { AccountService } from '@app/_services';

// @Injectable({ providedIn: 'root' })
// export class AuthGuard implements CanActivate {
//     constructor(
//         private router: Router,
//         private accountService: AccountService
//     ) { }

//     canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
//         const account = this.accountService.accountValue;
//         if (account) {
//             if (route.data['roles'] && !route.data['roles'].includes(account.role)) {
//                 this.router.navigate(['/']);
//                 return false;
//             }
//             return true;
//         }

//         // Try to refresh token before redirecting
//         return this.accountService.refreshToken().pipe(
//             map(account => {
//                 if (route.data['roles'] && !route.data['roles'].includes(account.role)) {
//                     this.router.navigate(['/']);
//                     return false;
//                 }
//                 return true;
//             }),
//             catchError(() => {
//                 this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
//                 return of(false);
//             })
//         );
//     }
// }
