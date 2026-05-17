import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';

@Component({ templateUrl: 'add-edit.component.html', standalone: false })
export class AddEditComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  id?: string;
  title!: string;
  loading = false;
  submitting = false;
  submitted = false;

  private loadTimeoutId?: number;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

ngOnInit() {
    
    // Method 1: Get from snapshot
    this.id = this.route.snapshot.params['id'];
    
    // Method 2: Subscribe to params (in case they change)
    this.route.params.subscribe(params => {
        this.id = params['id'];
        
        // If ID exists, load the data
        if (this.id) {
            this.loadAccountData();
        }
    });
    
    // Create form
    this.form = this.formBuilder.group({
        title: ['', Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        role: ['', Validators.required],
        password: ['', [Validators.minLength(6)]],
        confirmPassword: ['']
    }, {
        validator: MustMatch('password', 'confirmPassword')
    });
    
    this.title = this.id ? 'Edit Account' : 'Create Account';
}

// Separate method to load account data
loadAccountData() {
    
    this.loading = true;
    this.cdr.detectChanges();
    
    // DIRECT SUBSCRIPTION - NO PIPES
    this.accountService.getById(this.id!).subscribe({
        next: (data) => {
            this.form.patchValue(data);
            this.loading = false;
            this.cdr.detectChanges();
        },
        error: (err) => {
            this.alertService.error('Failed to load account');
            this.loading = false;
            this.cdr.detectChanges();
        }
    });
    
}

  ngOnDestroy() {
    if (this.loadTimeoutId) {
      window.clearTimeout(this.loadTimeoutId);
      this.loadTimeoutId = undefined;
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.cdr.detectChanges();

    this.alertService.clear();

    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();

    // create or update account based on id param
    let saveAccount: () => any;
    let message: string;
    if (this.id) {
      saveAccount = () => this.accountService.update(this.id!, this.form.value);
      message = 'Account updated';
    } else {
      saveAccount = () => this.accountService.create(this.form.value);
      message = 'Account created';
    }

    saveAccount()
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success(message, { keepAfterRouteChange: true });
          this.router.navigateByUrl('/admin/accounts');
        },
        error: (error : any) => {
          this.alertService.error(error);
          this.submitting = false;
          this.cdr.detectChanges();
        }
      });
  }
}