import { describe, it } from "node:test";
import { micromarkObsidianWikilink } from "./syntax.js";
import { expect } from "chai";
import { micromark } from "micromark";

const obsidianWikilinkParser = (value: string) =>
    micromark(value, "utf-16be", {
        extensions: [micromarkObsidianWikilink()]
    });

await describe("obsdian wikilink parser should", async () => {
    await it("create wikilink without alias", () => {
        const textBeforeWikilink = "this is before";
        const wikilinkText = "This-is ä Text_inside the braÇkets";
        const textAfterWikilink = "this is after";
        const textWithWikilink = `${textBeforeWikilink}
        [[${wikilinkText}]] ${textAfterWikilink}`;
        const expectedWikilink = ""; // change after html implementation

        const result = obsidianWikilinkParser(textWithWikilink);

        expect(result).to.be.equal(
            `<p>${textBeforeWikilink}\n${expectedWikilink} ${textAfterWikilink}</p>`
        );
    });

    await it("should create wikilink if line starts or ends with it", () => {
        const wikilinkText = "This is Text_inside the brackets";
        const textWithOnlyWikilink = `[[${wikilinkText}]]`;
        const expectedWikilink = "";

        const result = obsidianWikilinkParser(textWithOnlyWikilink);

        expect(result).to.be.equal(`<p>${expectedWikilink}</p>`);
    });

    await it("not create wikilink if it is empty", () => {
        const emptyWikilink = "[[ ]]";
        const textWithAnEmptyWikilink = `this is some text ${emptyWikilink} this is another text`;

        const result = obsidianWikilinkParser(textWithAnEmptyWikilink);

        expect(result).to.be.equal(`<p>${textWithAnEmptyWikilink}</p>`);
    });

    await it("not create wikilink if first bracket is escaped", () => {
        const textWithEscapedLeftBracket = "a \\[[b]] c";

        const result = obsidianWikilinkParser(textWithEscapedLeftBracket);

        expect(result).to.be.equal(`<p>a [[b]] c</p>`);
    });

    await it("not create wikilink from just [[", () => {
        const textWithoutRightSquareBrackets =
            "This is the before text [[ this is the after text";

        const result = obsidianWikilinkParser(textWithoutRightSquareBrackets);

        expect(result).to.be.equal(`<p>${textWithoutRightSquareBrackets}</p>`);
    });

    await it("not create wikilink if preceding character from first [ is not whitespace, tab or nothing (beggining of line)", () => {
        const textWithNonSpacingCharacterBeforeFirstLeftBracket =
            "this is some text before[[this is inside]] this is after";

        expect(() =>
            obsidianWikilinkParser(
                textWithNonSpacingCharacterBeforeFirstLeftBracket
            )
        ).to.throw(/obsidianWikilink: previous character \d+ is not valid/);
    });

    await it("not create wikilink from unclosed [[", () => {
        const textWithUnclosedDoubleSquareBrackets =
            "This is the before text [[this is text inside the brackets] this is the after text";

        const result = obsidianWikilinkParser(
            textWithUnclosedDoubleSquareBrackets
        );

        expect(result).to.be.equal(
            `<p>${textWithUnclosedDoubleSquareBrackets}</p>`
        );
    });

    await it("not create wikilink if there is a linebreak before ]]", () => {
        const textWithLinebreakBeforeClosingBrackets = `a [[b
        ]] c`;

        const result = obsidianWikilinkParser(
            textWithLinebreakBeforeClosingBrackets
        );

        expect(result).to.be.equal("<p>a [[b\n]] c</p>");
    });

    await it("not create wikilink if there is a linebreak right after [[", () => {
        const textWithLinebreakAfterOpeningBrackets = `a [[
            b]] c`;

        const result = obsidianWikilinkParser(
            textWithLinebreakAfterOpeningBrackets
        );

        expect(result).to.be.equal("<p>a [[\nb]] c</p>");
    });

    await it("not create nested wikilinks", () => {
        const textFromOuterWikilink = "this is outer";
        const textFromInnerWikilink = "this is inner";
        const textAfterInnerWikilink = "some text";
        const textWithNestedWikilink = `[[${textFromOuterWikilink} [[${textFromInnerWikilink}]] ${textAfterInnerWikilink}]]`;
        const expectedInnerWikilink = "";

        const result = obsidianWikilinkParser(textWithNestedWikilink);

        expect(result).to.be.equal(
            `<p>[[${textFromOuterWikilink} ${expectedInnerWikilink} ${textAfterInnerWikilink}]]</p>`
        );
    });
});
