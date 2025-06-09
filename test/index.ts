import Fastify from "fastify";
import {
    ArkTypeSchemaTransformer,
    ArkTypeSerializerCompiler,
    ArkTypeTypeProvider,
    ArkTypeValidatorCompiler,
} from "../index.mjs";
import { type } from "arktype";
import { expectType } from "tsd";
import assert from "assert";
import FastifySwagger from "@fastify/swagger";

const fastify = Fastify().withTypeProvider<ArkTypeTypeProvider>();

fastify.setValidatorCompiler(ArkTypeValidatorCompiler);
fastify.setSerializerCompiler(ArkTypeSerializerCompiler);

// Set up @fastify/swagger
fastify.register(FastifySwagger, {
    openapi: {
        info: {
            title: "My Fastify App",
            version: "1.0.0",
        },
        components: {
            securitySchemes: {
                apiKey: {
                    type: "apiKey",
                    name: "apiKey",
                    in: "header",
                },
            },
        },
    },
    transform: ArkTypeSchemaTransformer,
});

const paramsSchema = type({
    name: "string.alpha > 1",
    platform: "'android' | 'ios'",
});

const responseSchema = type({
    message: "string",
});

fastify.get(
    "/:platform/:name",
    {
        schema: {
            description: "post some data",
            tags: ["user", "code"],
            summary: "qwerty",
            security: [{ apiKey: [] }],
            params: paramsSchema,
            response: {
                200: responseSchema,
            },
        },
    },
    async (req, res) => {
        expectType<string>(req.params.name);
        expectType<"android" | "ios">(req.params.platform);

        res.code(200).send({
            message: "a",
        });
    }
);

const testRequests = async () => {
    const response = await fastify.inject({
        method: "GET",
        url: "/android/matteo",
    });

    expectType<{
        message: string;
    }>(response.json());

    assert(response.statusCode === 200, "Expected status code 200");

    const response2 = await fastify.inject({
        method: "GET",
        url: "/ios/a",
    });

    assert(response2.statusCode === 400, "Expected status code 400");
    assert(
        response2.json()["message"] === "name must be at least length 2 (was 1)",
        "Expected proper error message"
    );
};

testRequests()
    .then(() => console.log("Tests passed"))
    .catch((error) => console.error("Test failed:", error));
