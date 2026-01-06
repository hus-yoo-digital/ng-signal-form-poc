# Angular 21 Signal Forms POC

A proof-of-concept comparing **Old Reactive Forms** vs **New Signal Forms** in Angular 21.

## 🔄 Old Reactive Forms vs New Signal Forms

### **Major Differences**

| Aspect                     | Old Reactive Forms                                                      | New Signal Forms                                                        |
| -------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **State Management**       | `FormControl`/`FormGroup`/`FormArray` classes                           | Plain signal with object/arrays - just JavaScript data structures       |
| **API Style**              | Imperative (call methods, manage subscriptions manually)                | Declarative (define schema function, automatic tracking)                |
| **Reactivity Model**       | Observables + manual subscriptions + `async` pipe                       | Signals with automatic reactivity + fine-grained updates                |
| **Validation Setup**       | Validator arrays per control: `[Validators.required, Validators.email]` | Schema function with paths: `required(schemaPath.email)`                |
| **Type Safety**            | Manual typing required, generics optional                               | Full type inference from signal model automatically                     |
| **Two-way Binding**        | `[formControl]` / `formControlName` / `formGroupName` directives        | `[field]` directive only                                                |
| **Arrays (Dynamic Lists)** | `FormArray` with `.push()`, `.removeAt()`, `.at(index)`                 | Plain arrays with immutable spread operations                           |
| **Cross-field Validation** | `.valueChanges.subscribe()` + `updateValueAndValidity()`                | `valueOf()` in schema validation function - declarative                 |
| **Data Access (Read)**     | `.value` (ignores disabled) / `.getRawValue()` (includes disabled)      | Call signal: `model()` - always includes all fields                     |
| **Data Access (Write)**    | `.setValue()` / `.patchValue()` methods on controls                     | `signal.update()` / `signal.set()` with immutable patterns              |
| **Conditional Fields**     | `.enable()` / `.disable()` methods called imperatively                  | `disabled(path, () => condition)` in schema - declarative               |
| **Conditional Validation** | `.setValidators()` / `.clearValidators()` + `.updateValueAndValidity()` | `validate()` with conditional logic using `valueOf()` - automatic       |
| **Error Handling**         | `.errors` object on control, check with `hasError('errorKey')`          | `.errors()` array with objects `[{ kind, message }]`                    |
| **Status Tracking**        | `.valid`, `.invalid`, `.pending`, `.touched`, `.dirty`, `.pristine`     | `.valid()`, `.invalid()`, `.touched()`, `.dirty()` - all signals        |
| **Template Binding**       | `[formGroup]="form"` on form, `formControlName="field"` on inputs       | `[field]="userForm.field"` on inputs directly                           |
| **Nested Forms**           | `FormGroup` within `FormGroup` using `formGroupName`                    | Nested objects in signal model with nested schema paths                 |
| **Change Subscription**    | `.valueChanges` observable, must unsubscribe                            | Effects or computed signals - automatic cleanup                         |
| **Reset Behavior**         | `.reset()` method, optional default values                              | `signal.set()` with initial values                                      |
| **Async Validators**       | `AsyncValidatorFn`, returns `Observable<ValidationErrors \| null>`      | Same function signature, integrated in schema                           |
| **Custom Validators**      | `ValidatorFn` functions, return `ValidationErrors \| null`              | `validate()` in schema with access to `valueOf()` for cross-field logic |
| **Value Transformation**   | Combine with RxJS operators on `valueChanges`                           | Use computed signals or effects                                         |
| **Testing**                | Mock `FormControl`/`FormGroup` or use actual instances                  | Test signals directly - simpler unit tests                              |
| **Bundle Size Impact**     | ~15KB (minified + gzipped) for ReactiveFormsModule                      | Smaller - signals are part of core, only validators imported            |
| **Performance**            | Good - optimized over years, can have unnecessary change detection      | Better - fine-grained reactivity, fewer unnecessary updates             |

### **Pros & Cons**

#### Old Reactive Forms

**Pros**

- ✅ **Fine-Grained Control** - Granular control over every aspect of form state
- ✅ **RxJS Integration** - Powerful observable operators for complex workflows

**Cons**

- ❌ **Verbose** - More boilerplate code required
- ❌ **Manual Subscription Management** - Must handle `.subscribe()` and `unsubscribe()`
- ❌ **Memory Leaks Risk** - Easy to forget unsubscribing
- ❌ **Type Safety Overhead** - Manual typing required for full type safety
- ❌ **Separate State** - Form state lives separately from component data
- ❌ **Complex Dynamic Forms** - FormArray API can be cumbersome

#### New Signal Forms

**Pros**

- ✅ **Less Boilerplate** - Cleaner, more concise code
- ✅ **Automatic Reactivity** - No manual subscriptions needed
- ✅ **Type Inference** - Types inferred from your model automatically
- ✅ **Simpler Mental Model** - Plain objects/arrays in signals
- ✅ **Better Performance** - Fine-grained reactivity updates
- ✅ **No Memory Leaks** - No subscriptions to manage
- ✅ **Centralized Validation** - All validation logic in one schema
- ✅ **Modern Angular** - Aligned with signal-based architecture

**Cons**

- ❌ **Learning Curve** - Different mental model from reactive forms

### **Code Comparison Examples**

#### Creating a Form

Old

```typescript
form = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  username: new FormControl({ value: '', disabled: true }),
});
```

New

```typescript
formModel = signal({
  email: '',
  username: '',
});

// form() returns a FieldTree<TModel> object with field accessors
// userForm is NOT a signal - it's a FieldTree
// userForm.email is a field accessor (not called)
// userForm.email() returns the FieldState signal (called to access state)
userForm = form(this.formModel, (schemaPath) => {
  required(schemaPath.email);
  email(schemaPath.email);
  disabled(schemaPath.username, () => someCondition);
});
```

#### Cross-Field Validation

Old

```typescript
// Watch both password fields for cross-field validation
this.form.get('password')?.valueChanges.subscribe(() => {
  this.form.get('confirmPassword')?.updateValueAndValidity();
});

this.form.get('confirmPassword')?.valueChanges.subscribe(() => {
  const password = this.form.get('password')?.value;
  const confirmPassword = this.form.get('confirmPassword')?.value;

  const mismatch = confirmPassword && password !== confirmPassword;
  this.form.get('confirmPassword')?.setErrors(mismatch ? { passwordMismatch: true } : null);
});
```

New

```typescript
validate(schemaPath.confirmPassword, ({ valueOf, value }) => {
  const password = valueOf(schemaPath.password);
  const confirmPassword = value();
  return password !== confirmPassword
    ? { kind: 'mismatch', message: 'Passwords do not match' }
    : null;
});
```

#### Dynamic Arrays

Old

```typescript
get items(): FormArray {
  return this.form.get('items') as FormArray;
}

addItem() {
  this.items.push(new FormControl(''));
}

removeItem(index: number) {
  this.items.removeAt(index);
}
```

New

```typescript
addItem() {
  this.formModel.update(current => ({
    ...current,
    items: [...current.items, '']
  }));
}

removeItem(index: number) {
  this.formModel.update(current => ({
    ...current,
    items: current.items.filter((_, i) => i !== index)
  }));
}
```

#### Conditional Validation

Old

```typescript
// Must manually manage validators
this.form.get('setUsername')?.valueChanges.subscribe((checked) => {
  const usernameControl = this.form.get('username');
  if (checked) {
    usernameControl?.setValidators([
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-Z0-9_-]+$/),
    ]);
  } else {
    usernameControl?.clearValidators(); // Remove all validators
  }
  usernameControl?.updateValueAndValidity();
});
```

New

```typescript
// Validation only runs when needed - declarative approach
validate(schemaPath.username, ({ valueOf, value }) => {
  if (!valueOf(schemaPath.setUsername)) {
    return null; // Skip validation when checkbox unchecked
  }

  const username = value();

  // Required check (could use required() shorthand instead)
  if (!username || username.trim() === '') {
    return { kind: 'required', message: 'Username is required' };
  }

  // Min length check (could use minLength() shorthand instead)
  if (username.length < 3) {
    return { kind: 'minLength', message: 'Min 3 characters' };
  }

  // Pattern check (could use pattern() shorthand instead)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { kind: 'pattern', message: 'Invalid format' };
  }

  return null;
});
```

#### Template Binding

Old

```html
<!-- Must use [formGroup] on form element and formControlName on inputs -->
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input type="email" formControlName="email" />

  <!-- Access control via form.get() -->
  @if (form.get('email')?.invalid) {
  <span class="error">{{ getEmailError() }}</span>
  }
</form>
```

New

```html
<!-- No [formGroup] directive needed, only [field] on inputs -->
<form (ngSubmit)="onSubmit()">
  <input type="email" [field]="userForm.email" />

  <!-- Direct access to field via signals -->
  @if (userForm.email().invalid()) {
  <span class="error">{{ userForm.email().errors()[0].message }}</span>
  }
</form>
```

#### Data Access (Read)

Old

```typescript
// .value ignores disabled fields
const formValue = this.form.value;
console.log(formValue); // { email: 'test@test.com', password: '123' }
// username is missing if disabled

// .getRawValue() includes disabled fields
const rawValue = this.form.getRawValue();
console.log(rawValue); // { email: 'test@test.com', password: '123', username: 'john' }
```

New

```typescript
// Call signal - always includes all fields (enabled and disabled)
const formValue = this.formModel();
console.log(formValue); // { email: 'test@test.com', password: '123', username: 'john' }
// No distinction between enabled/disabled - all data is accessible
```

#### Change Subscription

Old

```typescript
// Manual subscription - must remember to unsubscribe!
private subscription: Subscription;

ngOnInit() {
  this.subscription = this.form.valueChanges.subscribe((value) => {
    console.log('Form changed:', value);
    // Perform side effects
  });
}

ngOnDestroy() {
  this.subscription.unsubscribe(); // Must cleanup manually
}
```

New

```typescript
// Automatic reactivity with effect - no manual cleanup needed
constructor() {
  effect(() => {
    const formData = this.formModel();
    console.log('Form changed:', formData);
    // Perform side effects
  }); // Automatically cleaned up when component destroyed
}
```

### When to Use `validate()`

| Use Case                   | Description                                                        | Example                                         |
| -------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| **Cross-field validation** | Access other field values via `valueOf()` for comparison           | Password confirmation matching                  |
| **Conditional validation** | Skip validation based on other fields - return `null` early        | Username validation only when checkbox enabled  |
| **Complex custom logic**   | Multiple validation rules in one function with custom error shapes | Min/max length + pattern + custom business rule |
| **Array validation**       | Validate entire arrays or collections at once                      | Validate list has min/max items                 |

**Note:** For simple single-field validation, use built-in validators: `required()`, `email()`, `minLength()`, `pattern()`.

#### `validate()` Return Values

| Return Value | Meaning                                       | Example                                                         |
| ------------ | --------------------------------------------- | --------------------------------------------------------------- |
| `null`       | Field is **valid** - no errors                | `return null;`                                                  |
| Error Object | Field is **invalid** - contains error details | `return { kind: 'mismatch', message: 'Passwords must match' };` |

**Error Object Structure:**

- `kind`: String identifier for error type (e.g., `'required'`, `'mismatch'`, `'minLength'`)
- `message`: Human-readable error message
- **Custom properties**: You can add any additional properties you need (e.g., `minLength: 10`, `actualLength: 5`)

## 🔗 Resources

- [Angular Signal Forms Documentation](https://angular.dev/guide/forms/signal-forms)
- [Reactive Forms Documentation](https://angular.dev/guide/forms/reactive-forms)
- [Angular Signals Guide](https://angular.dev/guide/signals)
