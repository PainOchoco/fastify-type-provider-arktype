# Fastify - ArkType type provider

A type provider for [ArkType](https://arktype.io/).

## Installation

```
npm install arktype
npm install fastify-type-provider-arktype
```

## Usage

```js
import Fastify from "fastify";
import { ArkTypeTypeProvider, ArkTypeValidatorCompiler } from "fastify-type-provider-arktype";
import { type } from "arktype";

const fastify = Fastify().withTypeProvider<ArkTypeTypeProvider>();
// Optional type compiler
fastify.setValidatorCompiler(ArkTypeValidatorCompiler);
```

## Example

You can find a full example in [the test](./test/index.ts)
