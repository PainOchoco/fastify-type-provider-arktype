import {
    FastifyPluginAsync,
    FastifyPluginCallback,
    FastifyPluginOptions,
    FastifySchemaCompiler,
    FastifyTypeProvider,
    RawServerBase,
    RawServerDefault,
} from "fastify";
import { FastifySchema, FastifySerializerCompiler } from "fastify/types/schema";
import { type, Type } from "arktype";

export interface ArkTypeTypeProvider extends FastifyTypeProvider {
    serializer: this["schema"] extends Type<any> ? this["schema"]["inferOut"] : unknown;
    validator: this["schema"] extends Type<any> ? this["schema"]["inferIn"] : unknown;
}

export const ArkTypeValidatorCompiler: FastifySchemaCompiler<Type<any>> = ({ schema }) => {
    return (data) => {
        const testedSchema = schema(data);
        if (testedSchema instanceof type.errors) {
            return { error: new Error(testedSchema.summary) };
        } else {
            return { value: testedSchema };
        }
    };
};

export const ArkTypeSerializerCompiler: FastifySerializerCompiler<Type<any>> = ({ schema }) => {
    return (data) => {
        const testedSchema = schema(data);

        if (testedSchema instanceof type.errors) {
            throw new Error(testedSchema.summary);
        }

        return JSON.stringify(testedSchema);
    };
};

export type FastifyPluginCallbackArkType<
    Options extends FastifyPluginOptions = Record<never, never>,
    Server extends RawServerBase = RawServerDefault
> = FastifyPluginCallback<Options, Server, ArkTypeTypeProvider>;

export type FastifyPluginAsyncArkType<
    Options extends FastifyPluginOptions = Record<never, never>,
    Server extends RawServerBase = RawServerDefault
> = FastifyPluginAsync<Options, Server, ArkTypeTypeProvider>;

interface Schema extends FastifySchema {
    hide?: boolean;
}

// For @fastify/swagger, enables OpenAPI schema generation
export const ArkTypeSchemaTransformer = ({ schema, url }: { schema: Schema; url: string }) => {
    if (!schema) {
        return {
            schema,
            url,
        };
    }

    const { params, body, querystring, headers, response, hide } = schema;
    const transformedSchema: Schema = {
        ...schema,
        params: undefined,
        body: undefined,
        querystring: undefined,
        headers: undefined,
        response: undefined,
    };

    // Transform the ArkType schema to JSON Schema
    if (params) transformedSchema.params = type(params).toJsonSchema();
    if (body) transformedSchema.body = type(body).toJsonSchema();
    if (querystring) transformedSchema.querystring = type(querystring).toJsonSchema();
    if (headers) transformedSchema.headers = type(headers).toJsonSchema();
    if (response && typeof response === "object") {
        transformedSchema.response = {};
        for (const statusCode in response) {
            (transformedSchema.response as Record<string, any>)[statusCode] = type(
                (response as any)[statusCode]
            ).toJsonSchema();
        }
    }

    // can add the hide tag if needed
    // if (url.startsWith("/internal")) transformedSchema.hide = true;
    if (hide) transformedSchema.hide = true;

    return { schema: transformedSchema, url };
};
