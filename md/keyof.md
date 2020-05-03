# Typescript 高级类型之keyof

## 基本概念
[索引类型（Index types）](https://www.tslang.cn/docs/handbook/advanced-types.html)

常见的用法，从某个对象中提取属性

```js
function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName]
}
```

## 映射类型：Partial、Pick、Record、Required
这几个都是从keyof衍生出来的概念，我们从一个例子出发

先定义一个`Person`接口
```js
interface Person {
    name: string;
    age: number;
}
```

如果我们想把`Person`的每个属性都变成可选的, 做法将会如下
```js
interface PersonPartial {
    name?: string;
    age?: number;
}
```
或者把属性变成只读的
```js
interface PersonReadonly {
    readonly name: string;
    readonly age: number;
}
```
TypeScript提供了从旧类型中创建新类型的一种方式 — 映射类型。
在映射类型里，新类型以相同的形式去转换旧类型里每个属性

```js
// 将类型定义的所有属性都修改为可选
type Partial<T> = {
    [P in keyof T]?: T[P];
}
// 将类型定义的所有属性都修改为只读的
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
}
```
那么在TS中想要达到上面转化已知类型的属性的相关将会简单很多
```js
type PersonPartial = Partial<Person>;
type PersonReadonly = Readonly<Person>;
```

同理，我们看下`Pick`、`Record`、`Required`的定义，就相对简单了
```js
// Pick  从类型定义的属性中，选取指定一组属性，返回一个新的类型定义
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
}

// Required将类型定义的所有属性都变成必填 与Partial作用相反
type Required<T> = {
    [P in keyof T]-?: T[P];
}


// Record 快速创建一个类型，此类型包含一组指定的属性且都是必填
type Record<K extends keyof any, T> = {
    [P in K]: T;
}
// 使用
type PersonRecord = Record<'x' | 'y', string>;
// 相当于
type PersonRecord = {
    x: string;
    y: string;
}
```