import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-old-reactive-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './old-reactive-form.component.html',
  styleUrls: ['./old-reactive-form.component.scss'],
})
export class OldReactiveFormComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      setUsername: [false],
      username: [{ value: '', disabled: true }],
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
}
