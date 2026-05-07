import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '@app/services';
import { Account } from '@app/models';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: false
})
export class AppComponent {
  account?: Account | null;

  constructor(
    private router: Router,
    private accountService: AccountService
  ) {
    this.accountService.account.subscribe(x => this.account = x);
  }

  logout() {
    this.accountService.logout();
  }
}