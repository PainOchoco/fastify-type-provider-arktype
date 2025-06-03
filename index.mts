import { FastifySchemaCompiler, FastifyTypeProvider } from "fastify";

import { type, Type } from "arktype";
import { TypeParser } from "arktype/out/type";

export interface ArkTypeTypeProvider extends FastifyTypeProvider {
    serializer: this["schema"] extends Type<any> ? this["schema"]["inferOut"] : unknown;
    validator: this["schema"] extends Type<any> ? this["schema"]["inferIn"] : unknown;
}

export const ArkTypeValidatorCompiler: FastifySchemaCompiler<TypeParser<any>> = ({ schema }) => {
    return (data) => {
        const testedType = schema(data);
        if (testedType instanceof type.errors) {
            return { error: new Error(testedType.summary) };
        } else {
            return { value: testedType };
        }
    };
};
