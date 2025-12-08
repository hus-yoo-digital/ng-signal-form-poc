# Angular 21 Signal Forms POC

A proof-of-concept comparing **Old Reactive Forms** vs **New Signal Forms** in Angular 21.

## 🔄 Old Reactive Forms vs New Signal Forms

### **Major Differences**

| Aspect                | Old Reactive Forms                        | New Signal Forms                   |
| --------------------- | ----------------------------------------- | ---------------------------------- |
| **State Management**  | `FormControl`/`FormGroup`/`FormArray`     | Plain signal with object/arrays    |
| **API Style**         | Imperative (methods, subscriptions)       | Declarative (schema function)      |
| **Reactivity**        | Observables + manual subscriptions        | Signals (automatic reactivity)     |
| **Validation**        | Validator arrays per control              | Schema function with paths         |
| **Type Safety**       | Manual (must define types)                | Inferred from model                |
| **Two-way Binding**   | `[formControl]` directive                 | `[field]` directive                |
| **Arrays**            | `FormArray` with `.push()`, `.removeAt()` | Plain array with immutable updates |
| **Cross-field Logic** | `.valueChanges.subscribe()`               | `valueOf()` in validation logic    |
| **Data Access**       | `.value` / `.getRawValue()`               | Call the signal: `model()`         |

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
