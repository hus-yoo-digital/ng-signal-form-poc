import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-old-reactive-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './old-reactive-form.component.html',
  styleUrls: ['./old-reactive-form.component.scss'],
})
export class OldReactiveFormComponent implements OnInit {
  form!: FormGroup;

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required]),
      setUsername: new FormControl(false),
      username: new FormControl({ value: '', disabled: true }),
    });

    // Watch password field to validate confirmPassword when it changes
    this.form.get('password')?.valueChanges.subscribe(() => {
      const confirmControl = this.form.get('confirmPassword');
      if (confirmControl?.value) {
        confirmControl.updateValueAndValidity();
      }
    });

    // Watch confirmPassword to validate against password
    this.form.get('confirmPassword')?.valueChanges.subscribe((confirmValue) => {
      const passwordValue = this.form.get('password')?.value;
      const confirmControl = this.form.get('confirmPassword');

      if (confirmValue && passwordValue !== confirmValue) {
        confirmControl?.setErrors({ ...confirmControl.errors, passwordMismatch: true });
      } else {
        // Remove only the passwordMismatch error
        const errors = confirmControl?.errors;
        if (errors) {
          delete errors['passwordMismatch'];
          confirmControl?.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
      }
    });

    // Watch the checkbox to enable/disable username field
    this.form.get('setUsername')?.valueChanges.subscribe((checked) => {
      const usernameControl = this.form.get('username');
      if (checked) {
        usernameControl?.enable();
        usernameControl?.setValidators([
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z0-9_-]+$/),
        ]);
      } else {
        usernameControl?.disable();
        usernameControl?.clearValidators();
      }
      usernameControl?.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Old Reactive Form submitted:', this.form.getRawValue());
      alert('Form submitted successfully! Check console for values.');
    }
  }

  getEmailError(): string {
    const emailControl = this.form.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email')) {
      return 'Enter a valid email address';
    }
    return '';
  }

  getUsernameError(): string {
    const usernameControl = this.form.get('username');
    if (usernameControl?.hasError('required')) {
      return 'Username is required';
    }
    if (usernameControl?.hasError('minlength')) {
      return 'Username must be at least 3 characters';
    }
    if (usernameControl?.hasError('pattern')) {
      return 'Username can only contain letters, numbers, dashes, and underscores';
    }
    return '';
  }

  getPasswordError(): string {
    const passwordControl = this.form.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }
    return '';
  }

  getConfirmPasswordError(): string {
    const confirmControl = this.form.get('confirmPassword');
    if (confirmControl?.hasError('required')) {
      return 'Please confirm your password';
    }
    if (confirmControl?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }
}
