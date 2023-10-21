import { describe, it } from "node:test";
import { micromarkObsidianWikilink } from "./syntax.js";
import { expect } from "chai";
import { micromark } from "micromark";

await describe("obsdian wikilink parser should", async () => {
    // crete text for not allowing nested wikilinks
    // make test that checks the allowed characters for target
    // make test that checks that it doesnt form wikilink if there is linebreak before ]]
    await it("not create wikilink from just [[", () => {
        const textWithoutRightSquareBrackets =
            "This is the before text [[ this is the after text";

        const result = micromark(textWithoutRightSquareBrackets, "utf-16be", {
            extensions: [micromarkObsidianWikilink()]
        });

        expect(result).to.be.equal(`<p>${textWithoutRightSquareBrackets}</p>`);
    });

    await it("not create wikilink if first bracket is escaped", () => {
        // prettier-ignore
        const textWithEscapedLeftBracket =
            // eslint-disable-next-line no-useless-escape
            "a \\[[b]] c";

        const result = micromark(textWithEscapedLeftBracket, "utf-16be", {
            extensions: [micromarkObsidianWikilink()]
        });

        expect(result).to.be.equal(`<p>a [[b]] c</p>`);
    });

    await it("not create wikilink if preceding character from first [ is not whitespace, tab or nothing (beggining of line)", () => {
        const textWithNonSpacingCharacterBeforeFirstLeftBracket =
            "this is some text before[[this is inside]] this is after";

        expect(() =>
            micromark(
                textWithNonSpacingCharacterBeforeFirstLeftBracket,
                "utf-16be",
                {
                    extensions: [micromarkObsidianWikilink()]
                }
            )
        ).to.throw(/obsidianWikilink: previous character \d+ is not valid/);
    });

    await it("not create wikilink if it is empty", () => {
        const emptyWikilink = "[[ ]]";
        const textWithAnEmptyWikilink = `this is some text ${emptyWikilink} this is another text`;

        const result = micromark(textWithAnEmptyWikilink, "utf-16be", {
            extensions: [micromarkObsidianWikilink()]
        });

        expect(result).to.be.equal(`<p>${textWithAnEmptyWikilink}</p>`);
    });

    await it("not create wikilink from unclosed [[", () => {
        const textWithUnclosedDoubleSquareBrackets =
            "This is the before text [[this is text inside the brackets] this is the after text";

        const result = micromark(
            textWithUnclosedDoubleSquareBrackets,
            "utf-16be",
            {
                extensions: [micromarkObsidianWikilink()]
            }
        );

        expect(result).to.be.equal(
            `<p>${textWithUnclosedDoubleSquareBrackets}</p>`
        );
    });

    await it("create wikilink without alias", () => {
        const textBeforeWikilink = "this is before";
        const wikilinkText = "This is Text_inside the brackets";
        const textAfterWikilink = "this is after";
        const textWithWikilink = `${textBeforeWikilink}
        [[${wikilinkText}]] ${textAfterWikilink}`;
        const expectedWikilink = ""; // change after html implementation

        const result = micromark(textWithWikilink, "utf-16be", {
            extensions: [micromarkObsidianWikilink()]
        });

        expect(result).to.be.equal(
            `<p>${textBeforeWikilink}\n${expectedWikilink} ${textAfterWikilink}</p>`
        );
    });

    await it("should create wikilink if line starts or ends with it", () => {
        const wikilinkText = "This is Text_inside the brackets";
        const textWithOnlyWikilink = `[[${wikilinkText}]]`;
        const expectedWikilink = "<p></p>";

        const result = micromark(textWithOnlyWikilink, "utf-16be", {
            extensions: [micromarkObsidianWikilink()]
        });

        expect(result).to.be.equal(expectedWikilink);
    });
});
