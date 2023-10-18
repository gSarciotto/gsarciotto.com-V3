import { describe, it } from "node:test";
import { micromarkObsidianWikilink } from "./syntax.js";
import { expect } from "chai";
import { micromark } from "micromark";

await describe("obsdian wikilink parser should", async () => {
    await it("not create wikilink from just [[", () => {
        const textWithoutRightSquareBrackets =
            "This is the before text [[ this is the after text";

        const result = micromark(textWithoutRightSquareBrackets, "utf-16be", {
            extensions: [micromarkObsidianWikilink()]
        });

        expect(result).to.be.equal(`<p>${textWithoutRightSquareBrackets}</p>`);
    });

    await it(
        "not create wikilink if preceding characters from first [ is not whitespace",
        { todo: true }
    );
    //make text to allow whitespace after [[ and before ]], should allow white space between the brackets?
    // make case for empty [[]]

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
        const textBeforeWikilink = "This is the before text ";
        const wikilinkText = "This is Text_inside the brackets";
        const textAfterWikilink = " this is the after text";
        const textWithWikilink =
            textBeforeWikilink + "[[" + wikilinkText + "]]" + textAfterWikilink;
        const expectedWikilink = ""; // change after html implementation

        const result = micromark(textWithWikilink, "utf-16be", {
            extensions: [micromarkObsidianWikilink()]
        });

        expect(result).to.be.equal(
            `<p>${textBeforeWikilink}${expectedWikilink}${textAfterWikilink}</p>`
        );
    });

    await it("should create wikilink if the line start with wikilink", {
        todo: true
    }); // dunno if needed

    // have to do alias and anchor links as well
});
