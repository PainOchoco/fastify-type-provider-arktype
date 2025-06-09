# Fastify - ArkType type provider

A type provider for [ArkType](https://arktype.io/).

## Installation

```
npm install arktype
npm install fastify-type-provider-arktypeio
```

## Usage

```js
import Fastify from "fastify";
import { ArkTypeTypeProvider, ArkTypeValidatorCompiler, ArkTypeSerializerCompiler } from "fastify-type-provider-arktype";
import { type } from "arktype";

const fastify = Fastify().withTypeProvider<ArkTypeTypeProvider>();
// Optional compilers
fastify.setValidatorCompiler(ArkTypeValidatorCompiler);
fastify.setSerializerCompiler(ArkTypeSerializerCompiler);
```

## Example

You can find a full example including OpenAPI schema generation in [the test](./test/index.ts)
