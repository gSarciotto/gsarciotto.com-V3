import type {
    Code,
    Construct,
    Effects,
    Extension,
    State,
    Tokenizer
} from "micromark-util-types";
import {
    codes as micromarkCodes,
    types as micromarkTypes
} from "micromark-util-symbol";
import assert from "node:assert";

/* TODO
We have to change the tests so they dont use fromMarkdown, instead we will test micromark only. For that we also need to write an extension to the html compiler:
1. user has to setup a base url on initialization -> check for / at the end
2. render anchor links with the href as base url + normalized wikilink target (replace spaces with -) and text as the non normalized wikilink target (in the future use alias as well)
3. allow user to optionally pass a function that gets the normalized wikilink target
*/

// colocar o jsdocs
export function micromarkObsidianWikilink(): Extension {
    // rename this, remove the micromark and add syntax?
    const obsidianWikilinkConstruct: Construct = {
        name: "obsidianWikilink",
        tokenize: obsidianWikilinkTokenizer
    };

    return {
        text: { [micromarkCodes.leftSquareBracket]: obsidianWikilinkConstruct }
    };
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function obsidianWikilinkTokenizer(
    effects: Effects,
    ok: State,
    nok: State
): ReturnType<Tokenizer> {
    console.log("tokenizer");
    return start;

    /**
     * @type {State}
     */
    function start(code: Code): State | undefined {
        console.log("start begin", code);
        assert(
            code === micromarkCodes.leftSquareBracket,
            "obsidianWikilink: expected '['"
        );

        effects.attempt;
        effects.enter(micromarkTypes.obsidianWikilink);
        effects.enter(micromarkTypes.obsidianWikilinkMarker);
        effects.consume(code);
        console.log("start end");

        return parseSecondLeftSquareBracket;
    }

    /**
     * @type {State}
     */
    function parseSecondLeftSquareBracket(code: Code): State | undefined {
        console.log("parseSecondLeftBracket: begin", code);
        if (code === micromarkCodes.leftSquareBracket) {
            console.log("parseSecondLeftBracket: code is left square bracket");
            effects.consume(code);
            effects.exit(micromarkTypes.obsidianWikilinkMarker);
            effects.enter(micromarkTypes.obsidianWikilinkTarget);

            return parseWikilinkTarget;
        }
        console.log("parseSecondLeftBracket: end");
        return nok;
    }

    /**
     * @type {State}
     */
    function parseWikilinkTarget(code: Code): State | undefined {
        // make test that checks the allowed characters for target
        // make test that checks that it doesnt form wikilink if there is linebreak before ]]
        // make test that checks for empty [[]]
        console.log("parseWikilinkTarget: begin", code);
        if (code === micromarkCodes.eof) {
            return nok;
        }
        if (code === micromarkCodes.rightSquareBracket) {
            console.log("parseWikilinkTarget: found right bracket");
            effects.exit(micromarkTypes.obsidianWikilinkTarget);
            effects.enter(micromarkTypes.obsidianWikilinkMarker);
            effects.consume(code);

            return parseSecondRightSquareBracket;
        }
        effects.consume(code);
        return parseWikilinkTarget;
    }

    /**
     * @type {State}
     */
    function parseSecondRightSquareBracket(code: Code): State | undefined {
        console.log("parseSecondRightSquareBracket: begin", code);
        if (code === micromarkCodes.rightSquareBracket) {
            console.log(
                "parseSecondRightSquareBracket: found second right bracket"
            );
            effects.consume(code);
            effects.exit(micromarkTypes.obsidianWikilinkMarker);
            effects.exit(micromarkTypes.obsidianWikilink);

            return ok;
        }
        console.log(
            "parseSecondRightSquareBracket: didnt find second right bracket"
        );
        return nok;
    }
}
