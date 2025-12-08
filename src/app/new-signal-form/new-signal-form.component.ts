import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import {
  disabled,
  email,
  Field,
  form,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';

@Component({
  selector: 'app-new-signal-form',
  standalone: true,
  imports: [CommonModule, Field],
  templateUrl: './new-signal-form.component.html',
  styleUrls: ['./new-signal-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewSignalFormComponent {
  formModel = signal({
    email: '',
    password: '',
    confirmPassword: '',
    longPassword: false,
    setUsername: false,
    username: '',
    reincarnationWishes: [] as string[],
  });

  // Computed signal: automatically updates when email changes
  emailCharCount = computed(() => this.formModel().email.length);

  // Signal for auto-save status message
  autoSaveStatus = signal<string>('');

  constructor() {
    // Effect: automatically saves form to localStorage whenever it changes
    // No manual subscription needed, no cleanup required!
    effect(() => {
      const formData = this.formModel();
      localStorage.setItem('signalFormDraft', JSON.stringify(formData));
      this.autoSaveStatus.set(`Auto-saved at ${new Date().toLocaleTimeString()}`);
    });
  }

  // schemaPath type: SchemaPathTree<{ email: string; password: string; confirmPassword: string; setUsername: boolean; username: string; }>
  userForm = form(this.formModel, (schemaPath) => {
    // Email validation
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });

    // Password validation
    required(schemaPath.password, { message: 'Password is required' });
    // Conditional minLength based on longPassword checkbox
    validate(schemaPath.password, ({ valueOf, value }: any) => {
      const isLongPassword = valueOf(schemaPath.longPassword);
      const password = value();

      if (isLongPassword && password && password.length < 10) {
        return {
          kind: 'minLength',
          message: 'Password must be at least 10 characters',
        };
      }
      return null;
    });

    // Confirm password validation
    required(schemaPath.confirmPassword, { message: 'Please confirm your password' });
    // Cross-field validation: confirmPassword must match password
    validate(schemaPath.confirmPassword, ({ valueOf, value }: any) => {
      const password = valueOf(schemaPath.password);
      const confirmPassword = value();

      if (confirmPassword && password !== confirmPassword) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match',
        };
      }
      return null;
    });

    // Username is disabled when checkbox is false
    disabled(schemaPath.username, ({ valueOf }: any) => !valueOf(schemaPath.setUsername));

    // Username validation - runs conditionally
    required(schemaPath.username, {
      message: ({ valueOf }: any) =>
        valueOf(schemaPath.setUsername) ? 'Username is required' : '',
    });
    minLength(schemaPath.username, 3, {
      message: ({ valueOf }: any) =>
        valueOf(schemaPath.setUsername) ? 'Username must be at least 3 characters' : '',
    });
    pattern(schemaPath.username, /^[a-zA-Z0-9_-]+$/, {
      message: ({ valueOf }: any) =>
        valueOf(schemaPath.setUsername)
          ? 'Username can only contain letters, numbers, dashes, and underscores'
          : '',
    });

    // Reincarnation wishes validation - each array item must be required
    // We'll use a custom validate to check each item
    validate(schemaPath.reincarnationWishes, ({ value }: any) => {
      const wishes = value() as string[];
      // Check if any wish is empty
      const hasEmptyWish = wishes.some((wish: string) => !wish || wish.trim() === '');
      if (hasEmptyWish) {
        return {
          kind: 'required',
          message: 'All reincarnation wishes must be filled',
        };
      }
      return null;
    });
  });

  addReincarnationWish() {
    if (this.formModel().reincarnationWishes.length < 3) {
      this.formModel.update((current) => ({
        ...current,
        reincarnationWishes: [...current.reincarnationWishes, ''],
      }));
    }
  }

  removeReincarnationWish(index: number) {
    this.formModel.update((current) => ({
      ...current,
      reincarnationWishes: current.reincarnationWishes.filter((_, i) => i !== index),
    }));
  }

  onSubmit() {
    if (this.userForm().valid()) {
      console.log('New Signal Form submitted:', this.formModel());
      alert('Form submitted successfully! Check console for values.');
    }
  }

  setReincarnationValue(value: string) {
    // Find the first empty field in the array and set its value
    const wishes = this.formModel().reincarnationWishes;
    const emptyIndex = wishes.findIndex((wish) => !wish || wish.trim() === '');

    if (emptyIndex !== -1) {
      this.formModel.update((current) => ({
        ...current,
        reincarnationWishes: current.reincarnationWishes.map((wish, i) =>
          i === emptyIndex ? value : wish
        ),
      }));
    }
  }
}
