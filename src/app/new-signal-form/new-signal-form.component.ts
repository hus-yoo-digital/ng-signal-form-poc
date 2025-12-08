import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { disabled, email, Field, form, minLength, pattern, required } from '@angular/forms/signals';

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
    setUsername: false,
    username: '',
  });

  // schemaPath type: SchemaPathTree<{ email: string; setUsername: boolean; username: string; }>
  userForm = form(this.formModel, (schemaPath) => {
    // Email validation
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });

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
  });

  onSubmit() {
    if (this.userForm().valid()) {
      console.log('New Signal Form submitted:', this.formModel());
      alert('Form submitted successfully! Check console for values.');
    }
  }
}
