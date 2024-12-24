# async-validator

异步验证表单。https://github.com/freeformsystems/async-validate 的变体。

## 安装

```bash
npm i async-validator
```

## 使用

基本用法包括定义一个描述符，并将其分配给一个模式，然后将需要验证的对象和回调函数传递给模式的`validate`方法：

```js
import Schema from 'async-validator'
const descriptor = {
  name: {
    type: 'string',
    required: true,
    validator: (rule, value) => value === 'muji',
  },
  age: {
    type: 'number',
    asyncValidator: (rule, value) => {
      return new Promise((resolve, reject) => {
        if (value < 18) {
          reject('too young') // reject with error message
        } else {
          resolve()
        }
      })
    },
  },
}
const validator = new Schema(descriptor)
validator.validate({ name: 'muji' }, (errors, fields) => {
  if (errors) {
    //验证失败，errors是所有错误的数组
    // fields是一个由字段名作为键值的对象，数组为
    //每个字段的错误
    return handleErrors(errors, fields)
  }
  // 验证通过了
})

// PROMISE USAGE
validator
  .validate({ name: 'muji', age: 16 })
  .then(() => {
    // 验证通过或没有错误消息
  })
  .catch(({ errors, fields }) => {
    return handleErrors(errors, fields)
  })
```

## API

### Validate

```js
function(source, [options], callback): Promise
```

- `source`: 需要验证的对象（必须提供）。
- `options`: 一个描述验证处理选项的对象（可选）。
- `callback`: 验证完成时调用的回调函数（可选）。

该方法将返回一个 Promise 对象，如下所示：

- `then()`，验证通过了
- `catch({ errors, fields })`，验证失败，errors 是一个包含所有错误的数组，fields 是一个由字段名键控的对象，每个字段包含一个错误数组

### 选项

- `suppressWarning`: 布尔值，是否抑制关于无效值的内部警告。

- `first`: 当第一个验证规则生成错误时调用 `callback` 不再处理任何验证规则。如果您的验证涉及多个异步调用（例如，数据库查询），并且您只需要第一个错误，请使用此选项。

- `firstFields`: 当指定字段的第一个验证规则产生错误时，调用`callback`。不再处理同一字段的验证规则。“true”表示所有字段。

### 规则

规则可以是执行验证的函数。

```js
function(rule, value, callback, source, options)
```

- `rule`: 源描述符中与要验证的字段名相对应的验证规则。它总是被分配一个带有被验证字段名称的`field`属性。
- `value`: 正在验证的源对象属性的值。
- `callback`:验证完成后调用的回调函数。它期望传递一个`Error`实例数组来指示验证失败。如果检查是同步的，则可以直接返回`false`或`Error`或`Error Array`。
- `source`: 传递给`validate`方法的源对象。
- `options`: 额外的选项。
- `options.messages`: 包含验证错误消息的对象将与 `defaultMessages` 深度合并。

传递给`validate`或`asyncValidate`的选项被传递给验证函数，以便您可以在验证函数中引用瞬态数据（例如模型引用）。然而，有些选项名称是保留的；如果使用 options 对象的这些属性，它们将被覆盖。保留的属性是`messages`， `exception`和`error`。

```js
import Schema from 'async-validator'
const descriptor = {
  name(rule, value, callback, source, options) {
    const errors = []
    if (!/^[a-z0-9]+$/.test(value)) {
      errors.push(
        new Error(
          util.format(
            '%s must be lowercase alphanumeric characters',
            rule.field
          )
        )
      )
    }
    return errors
  },
}
const validator = new Schema(descriptor)
validator.validate({ name: 'Firstname' }, (errors, fields) => {
  if (errors) {
    return handleErrors(errors, fields)
  }
  // validation passed
})
```

针对单个字段测试多个验证规则通常是有用的，这样做可以使规则成为对象数组，例如：

```js
const descriptor = {
  email: [
    { type: 'string', required: true, pattern: Schema.pattern.email },
    {
      validator(rule, value, callback, source, options) {
        const errors = []
        // test if email address already exists in a database
        // and add a validation error to the errors array if it does
        return errors
      },
    },
  ],
}
```

#### 类型

指示要使用的验证器的“类型”。可识别的类型值有：

- `string`: 必须是 `string` 类型。 这是默认类型。
- `number`: 必须是 `number` 类型。
- `boolean`: 必须是 `boolean` 类型。
- `method`: 必须是 `function` 类型。
- `regexp`: 必须是一个 `RegExp` 的实例，或者在创建一个新的 `RegExp` 时不会产生异常的字符串。
- `integer`: 必须是 `number` 且是整数。
- `float`: 必须是 `number` 且必须是浮点数。
- `array`: 必须是由 `Array.isArray` 确定的数组。
- `object`: 必须是 `object` 且不是 `Array.isArray`.
- `enum`: 值必须存在于 `enum` 配置项中.
- `date`: 值必须有效且为 `Date` 类型。
- `url`: 必须是 `url` 类型。
- `hex`: 必须是 `hex` 类型。
- `email`: 必须是 `email` 类型。
- `any`: 可以是任意类型。

#### 必填

`required`规则属性指示该字段必须存在于被验证的源对象上。

#### Pattern

`pattern` 规则属性指示值必须匹配的正则表达式才能通过验证。

#### Range

范围是使用`min`和`max`属性定义的。对于‘字符串’和‘数组’类型，对‘长度’进行比较，对于‘数字’类型，数字不得小于`min`或大于`max`。

#### Length

要验证字段的确切长度，请指定`len`属性。对于`string`和`array`类型，对`length`属性进行比较，对于`number`类型，此属性表示与`number`精确匹配，即它可能只严格等于`len`。

如果`len`属性与`min`和`max`范围属性组合，`len`优先。

#### Enumerable

> 从 3.0.0 版本开始，如果你想要验证`enum`类型中的值`0`或`false`，你必须显式地包含它们。

要从可能的值列表中验证一个值，使用`enum`类型和`enum`属性列出该字段的有效值，例如：

```js
const descriptor = {
  role: { type: 'enum', enum: ['admin', 'user', 'guest'] },
}
```

#### Whitespace

通常将只包含空格的必填字段视为错误。要为仅由空格组成的字符串添加额外的测试，请将`whitespace`属性添加到值为`true`的规则中。规则必须是`string`类型。

您可能希望清理用户输入，而不是测试空白，请参阅[transform]（#transform）中的一个示例，该示例允许您删除空白。

#### Deep Rules

如果你需要验证深层对象属性，你可以通过将嵌套规则分配给规则的`fields`属性来验证`object`或`array`类型的验证规则。

```js
const descriptor = {
  address: {
    type: 'object',
    required: true,
    fields: {
      street: { type: 'string', required: true },
      city: { type: 'string', required: true },
      zip: { type: 'string', required: true, len: 8, message: 'invalid zip' },
    },
  },
  name: { type: 'string', required: true },
}
const validator = new Schema(descriptor)
validator.validate({ address: {} }, (errors, fields) => {
  // errors for address.street, address.city, address.zip
})
```

注意，如果你没有在父规则上指定“required”属性，那么在源对象上声明的字段是完全有效的，并且深度验证规则将不会被执行，因为没有任何东西可以验证。

深度规则验证为嵌套规则创建一个模式，所以你也可以指定传递给`schema.validate()`方法的`options`。

```js
const descriptor = {
  address: {
    type: 'object',
    required: true,
    options: { first: true },
    fields: {
      street: { type: 'string', required: true },
      city: { type: 'string', required: true },
      zip: { type: 'string', required: true, len: 8, message: 'invalid zip' },
    },
  },
  name: { type: 'string', required: true },
}
const validator = new Schema(descriptor)

validator.validate({ address: {} }).catch(({ errors, fields }) => {
  // now only errors for street and name
})
```

父规则也会被验证，所以如果你有一组规则，比如：

```js
const descriptor = {
  roles: {
    type: 'array',
    required: true,
    len: 3,
    fields: {
      0: { type: 'string', required: true },
      1: { type: 'string', required: true },
      2: { type: 'string', required: true },
    },
  },
}
```

并提供一个 `{roles: ['admin', 'user']}` 的源对象，然后将创建两个错误。一个用于数组长度不匹配，另一个用于索引 2 处缺少所需的数组项。

#### defaultField

`defaultField` 属性可以与 `array` 或 `object` 类型一起使用，用于验证容器的所有值。
它可以是包含验证规则的 `object` 或 `array`。例如:

```js
const descriptor = {
  urls: {
    type: 'array',
    required: true,
    defaultField: { type: 'url' },
  },
}
```

注意`defaultField`被扩展为`fields`，参见 [deep rules](#deep-rules)。

#### Transform

有时需要在验证之前转换值，可能是为了强制值或以某种方式对其进行消毒。为此，在验证规则中添加一个 `transform` 函数。该属性在验证之前进行转换，并在通过验证时作为承诺结果或回调结果返回。

```js
import Schema from 'async-validator';
const descriptor = {
  name: {
    type: 'string',
    required: true,
    pattern: /^[a-z]+$/,
    transform(value) {
      return value.trim();
    },
  },
};
const validator = new Schema(descriptor);
const source = { name: ' user  ' };

validator.validate(source)
  .then((data) => assert.equal(data.name, 'user'));

validator.validate(source,(errors, data)=>{
  assert.equal(data.name, 'user'));
});
```

如果没有 `transform` 函数，由于输入包含前导和尾随空格，模式不匹配，验证将失败，但是通过添加 `transform` 函数，验证通过，同时对字段值进行消毒。

#### Messages

根据您的应用程序需求，您可能需要 i18n 支持，或者您可能更喜欢不同的验证错误消息。

实现这一点的最简单方法是为规则分配一个`message`：

```js
{ name: { type: 'string', required: true, message: 'Name is required' } }
```

消息可以是任何类型，例如 jsx 格式。

```js
{ name: { type: 'string', required: true, message: '<b>Name is required</b>' } }
```

Message 也可以是一个函数，例如如果你使用 vue-i18n：

```js
{ name: { type: 'string', required: true, message: () => this.$t( 'name is required' ) } }
```

您可能需要对不同的语言使用相同的模式验证规则，在这种情况下，为每种语言复制模式规则是没有意义的。

在这种情况下，你可以为语言提供你自己的消息，并将其分配给模式：

```js
import Schema from 'async-validator';
const cn = {
  required: '%s 必填',
};
const descriptor = { name: { type: 'string', required: true } };
const validator = new Schema(descriptor);
// deep merge with defaultMessages
validator.messages(cn);
...
```

如果您正在定义自己的验证函数，最好的做法是将消息字符串分配给消息对象，然后通过`options`访问消息。消息属性在验证函数中。

#### asyncValidator

您可以自定义指定字段的异步验证函数：

```js
const fields = {
  asyncField: {
    asyncValidator(rule, value, callback) {
      ajax({
        url: 'xx',
        value: value,
      }).then(
        function (data) {
          callback()
        },
        function (error) {
          callback(new Error(error))
        }
      )
    },
  },

  promiseField: {
    asyncValidator(rule, value) {
      return ajax({
        url: 'xx',
        value: value,
      })
    },
  },
}
```

#### validator

您可以为指定字段自定义验证函数：

```js
const fields = {
  field: {
    validator(rule, value, callback) {
      return value === 'test'
    },
    message: 'Value is not equal to "test".',
  },

  field2: {
    validator(rule, value, callback) {
      return new Error(`${value} is not equal to 'test'.`)
    },
  },

  arrField: {
    validator(rule, value) {
      return [new Error('Message 1'), new Error('Message 2')]
    },
  },
}
```

## FAQ

### 如何避免全局警告

```js
import Schema from 'async-validator'
Schema.warning = function () {}
```

或

```js
globalThis.ASYNC_VALIDATOR_NO_WARNING = 1
```

### 如何校验是否为 `true`

使用 `enum` 类型 `true` 选项.

```js
{
  type: 'enum',
  enum: [true],
  message: '',
}
```

## Test Case

```bash
npm test
```

## Coverage

```bash
npm run coverage
```

Open coverage/ dir

## License

Everything is [MIT](https://en.wikipedia.org/wiki/MIT_License).
