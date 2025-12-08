# Angular 21 Signal Forms POC

This project demonstrates the **OLD** vs **NEW** approaches to form handling in Angular 21.

## 🎯 Overview

Two parallel implementations of the exact same form with identical business logic:

1. **Old Reactive Forms** (`@angular/forms`)
2. **New Signal Forms** (`@angular/forms/signals`)

## 📋 Form Requirements

Both forms implement:

- **Email field**: Required + email format validation
- **Checkbox**: "Set username" toggle
- **Username field**: 
  - Disabled when checkbox is unchecked
  - When enabled, validates:
    - Required
    - Minimum 3 characters
    - Only letters, numbers, dashes (-), and underscores (_)
- **Submit button**: Enabled only when form is valid
- **Error messages**: Displayed in red below each field

## 🏃‍♂️ Running the Project

```bash
npm install
npm start
```

Navigate to `http://localhost:4200/`

## 🔄 Key Differences

### Old Reactive Forms Approach

**Location**: `src/app/old-reactive-form/`

```typescript
// Component setup
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  setUsername: [false],
  username: [{ value: '', disabled: true }]
});

// Dynamic validation with subscriptions
this.form.get('setUsername')?.valueChanges.subscribe(checked => {
  const usernameControl = this.form.get('username');
  if (checked) {
    usernameControl?.enable();
    usernameControl?.setValidators([
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-Z0-9_-]+$/)
    ]);
  } else {
    usernameControl?.disable();
    usernameControl?.clearValidators();
  }
  usernameControl?.updateValueAndValidity();
});
```

**Characteristics**:
- ✅ Stable, production-ready
- ✅ Observable-based
- ⚠️ Requires manual subscription management
- ⚠️ More boilerplate code
- ⚠️ Error handling requires helper methods

### New Signal Forms Approach

**Location**: `src/app/new-signal-form/`

```typescript
// Model-first approach
formModel = signal({
  email: '',
  setUsername: false,
  username: ''
});

// Schema-based validation
userForm = form(this.formModel, (schemaPath) => {
  // Email validation
  required(schemaPath.email, { message: 'Email is required' });
  email(schemaPath.email, { message: 'Enter a valid email address' });
  
  // Conditional disable
  disabled(schemaPath.username, ({ valueOf }) => 
    !valueOf(schemaPath.setUsername)
  );
  
  // Conditional validation
  required(schemaPath.username, { 
    message: ({ valueOf }) => 
      valueOf(schemaPath.setUsername) ? 'Username is required' : ''
  });
});
```

**Characteristics**:
- ✅ Signal-based reactivity
- ✅ Less boilerplate
- ✅ Centralized validation logic
- ✅ Automatic two-way binding
- ✅ Type-safe field access
- ⚠️ Experimental (Angular v21+)

## 📊 Comparison Table

| Feature | Old Reactive Forms | New Signal Forms |
|---------|-------------------|------------------|
| **State Management** | FormControl/FormGroup | Writable Signal |
| **Validation** | Validator array per control | Schema function |
| **Type Safety** | Manual typing | Inferred from model |
| **Two-way Binding** | Manual with `[formControl]` | Automatic with `[field]` |
| **Dynamic Logic** | Subscriptions + manual updates | Reactive schema functions |
| **Learning Curve** | Medium-High | Medium |
| **Production Ready** | ✅ Yes | ⚠️ Experimental |

## 🎨 Visual Differences

- **Old Forms**: Green theme (`#4CAF50`) - Traditional approach
- **New Forms**: Blue theme (`#2196F3`) - Modern signal-based

## 🧪 Testing Both Approaches

### Test Scenario 1: Email Validation
1. Leave email empty → "Email is required"
2. Type "test" → "Enter a valid email address"
3. Type "test@example.com" → Error disappears

### Test Scenario 2: Username Toggle
1. Username field is initially disabled
2. Check "Set username" → Field becomes enabled
3. Leave empty and blur → "Username is required"
4. Type "ab" → "Username must be at least 3 characters"
5. Type "ab@" → "Username can only contain letters, numbers, dashes, and underscores"
6. Type "abc" → Error disappears

### Test Scenario 3: Submit Button
- Button is disabled when form has errors
- Button is enabled only when all validations pass
- Clicking submit shows form values in console

## 📁 Project Structure

```
src/app/
├── old-reactive-form/
│   ├── old-reactive-form.component.ts
│   ├── old-reactive-form.component.html
│   └── old-reactive-form.component.scss
├── new-signal-form/
│   ├── new-signal-form.component.ts
│   ├── new-signal-form.component.html
│   └── new-signal-form.component.scss
├── app.routes.ts
├── app.ts
├── app.html
└── app.scss
```

## 🚀 When to Use What?

### Use Old Reactive Forms if:
- Working on existing projects with reactive forms
- Need production stability guarantees
- Team is experienced with reactive forms
- Complex dynamic forms with extensive custom logic

### Use New Signal Forms if:
- Starting a new Angular 21+ project
- Already using signals throughout your app
- Want less boilerplate and cleaner code
- Comfortable with experimental features
- Schema-based validation appeals to you

## 📚 Resources

- [Angular Signal Forms Documentation](https://angular.dev/guide/forms/signal-forms)
- [Reactive Forms Documentation](https://angular.dev/guide/forms/reactive-forms)
- [Angular Signals](https://angular.dev/guide/signals)

---

**Note**: Signal Forms are **experimental** as of Angular v21. The API may change before stabilizing. Always evaluate based on your project's stability requirements.
