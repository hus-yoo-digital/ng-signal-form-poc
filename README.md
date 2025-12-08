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
| **Error Handling**         | `.errors` object on control, check with `hasError('errorKey')`          | `.errors()` array with objects `[{ kind, message }]`                    |
| **Status Tracking**        | `.valid`, `.invalid`, `.pending`, `.touched`, `.dirty`, `.pristine`     | `.valid()`, `.invalid()`, `.touched()`, `.dirty()` - all signals        |
| **Change Detection**       | Works with any change detection strategy                                | Best with `OnPush` - optimized for signals                              |
| **Template Binding**       | `[formGroup]="form"` on form, `formControlName="field"` on inputs       | `[field]="userForm.field"` on inputs directly                           |
| **Nested Forms**           | `FormGroup` within `FormGroup` using `formGroupName`                    | Nested objects in signal model with nested schema paths                 |
| **Module/Import**          | `ReactiveFormsModule` from `@angular/forms`                             | `Field` directive and validators from `@angular/forms/signals`          |
| **Change Subscription**    | `.valueChanges` observable, must unsubscribe                            | Effects or computed signals - automatic cleanup                         |
| **Reset Behavior**         | `.reset()` method, optional default values                              | `signal.set()` with initial values                                      |
| **Async Validators**       | `AsyncValidatorFn`, returns `Observable<ValidationErrors \| null>`      | Same function signature, integrated in schema                           |
| **Custom Validators**      | `ValidatorFn` functions, return `ValidationErrors \| null`              | `validate()` in schema with access to `valueOf()` for cross-field logic |
| **Form Builder**           | `FormBuilder` service for less verbose syntax                           | Not needed - signal declaration is already concise                      |
| **Value Transformation**   | Combine with RxJS operators on `valueChanges`                           | Use computed signals or effects                                         |
| **Testing**                | Mock `FormControl`/`FormGroup` or use actual instances                  | Test signals directly - simpler unit tests                              |
| **Debugging**              | Chrome DevTools, RxJS debugging operators                               | Signal DevTools in Angular DevTools                                     |
| **Bundle Size Impact**     | ~15KB (minified + gzipped) for ReactiveFormsModule                      | Smaller - signals are part of core, only validators imported            |
| **Learning Resources**     | Extensive: docs, courses, Stack Overflow, 7+ years of content           | Limited: official docs, experimental guides, early adopter blogs        |
| **Migration Path**         | N/A - this is the current standard                                      | Can coexist with reactive forms, gradual migration possible             |
| **Browser Support**        | All browsers supported by Angular                                       | Same - signals are polyfilled for older browsers                        |
| **Performance**            | Good - optimized over years, can have unnecessary change detection      | Better - fine-grained reactivity, fewer unnecessary updates             |
| **Maturity & Stability**   | Stable since Angular 2 (2016), will be supported indefinitely           | Experimental (Angular 19+), API may change, production use at your risk |

### **Pros & Cons**

#### Old Reactive Forms

**Pros:**

- ✅ **Stable & Production-Ready** - Battle-tested, will be supported long-term
- ✅ **Extensive Documentation** - Years of community knowledge and examples
- ✅ **Fine-Grained Control** - Granular control over every aspect of form state
- ✅ **RxJS Integration** - Powerful observable operators for complex workflows
- ✅ **Backward Compatible** - Works with any Angular version
- ✅ **Rich Ecosystem** - Many third-party libraries and tools

**Cons:**

- ❌ **Verbose** - More boilerplate code required
- ❌ **Manual Subscription Management** - Must handle `.subscribe()` and `unsubscribe()`
- ❌ **Memory Leaks Risk** - Easy to forget unsubscribing
- ❌ **Type Safety Overhead** - Manual typing required for full type safety
- ❌ **Separate State** - Form state lives separately from component data
- ❌ **Complex Dynamic Forms** - FormArray API can be cumbersome

#### New Signal Forms

**Pros:**

- ✅ **Less Boilerplate** - Cleaner, more concise code
- ✅ **Automatic Reactivity** - No manual subscriptions needed
- ✅ **Type Inference** - Types inferred from your model automatically
- ✅ **Simpler Mental Model** - Plain objects/arrays in signals
- ✅ **Better Performance** - Fine-grained reactivity updates
- ✅ **No Memory Leaks** - No subscriptions to manage
- ✅ **Centralized Validation** - All validation logic in one schema
- ✅ **Modern Angular** - Aligned with signal-based architecture

**Cons:**

- ❌ **Experimental** - API may change (Angular 21+)
- ❌ **Limited Documentation** - New, less community knowledge
- ❌ **Learning Curve** - Different mental model from reactive forms
- ❌ **Fewer Examples** - Not many real-world patterns yet
- ❌ **Ecosystem Gap** - Third-party libraries not yet adapted
- ❌ **Breaking Changes Risk** - Being experimental, APIs could change

### **Code Comparison Examples**

#### Creating a Form

**Old Way:**

```typescript
form = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  username: new FormControl({ value: '', disabled: true }),
});
```

**New Way:**

```typescript
formModel = signal({
  email: '',
  username: '',
});

userForm = form(this.formModel, (schemaPath) => {
  required(schemaPath.email);
  email(schemaPath.email);
  disabled(schemaPath.username, () => someCondition);
});
```

#### Cross-Field Validation

**Old Way:**

```typescript
this.form.get('password')?.valueChanges.subscribe(() => {
  const confirmControl = this.form.get('confirmPassword');
  confirmControl?.updateValueAndValidity();
});
```

**New Way:**

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

**Old Way:**

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

**New Way:**

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

## 🚀 When to Use What?

### Use **Old Reactive Forms** if:

- Production stability is critical
- Working on existing reactive forms codebase
- Need extensive RxJS integration
- Team is experienced with reactive forms
- Relying on third-party form libraries

### Use **New Signal Forms** if:

- Starting a new Angular 21+ project
- Already using signals throughout your app
- Want cleaner, more maintainable code
- Comfortable with experimental features
- Building greenfield applications

## 🔗 Resources

- [Angular Signal Forms Documentation](https://angular.dev/guide/forms/signal-forms)
- [Reactive Forms Documentation](https://angular.dev/guide/forms/reactive-forms)
- [Angular Signals Guide](https://angular.dev/guide/signals)
