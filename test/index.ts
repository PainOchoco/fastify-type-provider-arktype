import Fastify from "fastify";
import { ArkTypeTypeProvider, ArkTypeValidatorCompiler } from "../index.mjs";
import { type } from "arktype";
import { expectType } from "tsd";
import assert from "assert";

const fastify = Fastify().withTypeProvider<ArkTypeTypeProvider>();
fastify.setValidatorCompiler(ArkTypeValidatorCompiler);

const paramsSchema = type({
    name: "string.alpha > 1",
    platform: "'android' | 'ios'",
});

const responseSchema = type({
    code: "number",
    message: "string",
});

fastify.get<{
    Params: typeof paramsSchema.inferIn;
    Reply: typeof responseSchema.inferOut;
}>(
    "/:platform/:name",
    {
        schema: {
            params: paramsSchema,
        },
    },
    async (request) => {
        expectType<string>(request.params.name);
        expectType<"android" | "ios">(request.params.platform);

        return { code: 123, message: "All good" };
    }
);

const testRequests = async () => {
    const response = await fastify.inject({
        method: "GET",
        url: "/android/matteo",
    });

    expectType<{
        code: number;
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
