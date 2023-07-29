import {describe, expect, test} from "@jest/globals";
import {getNameFromPayload} from "../handler";

describe("To get the name from the event payload", () => {
    test("Test: Get name if there is a valid payload", () => {
        expect(getNameFromPayload({body: {name: "Nirmal"}})).toStrictEqual('Nirmal');
    });

    test("Test: Error on invalid payload", () => {
        try {
            expect(getNameFromPayload({body: null})).toStrictEqual('Nirmal');
        } catch (error) {
            expect(error.message).toStrictEqual('Missing Required Property');
        }
    });
});
