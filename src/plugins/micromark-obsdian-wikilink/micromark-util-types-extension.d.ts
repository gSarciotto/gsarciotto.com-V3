import "micromark-util-types/index.d.ts";

declare module "micromark-util-types" {
    export interface TokenTypeMap {
        obsidianWikilink: "obsidianWikilink";
        obsidianWikilinkMarker: "obsidianWikilinkMarker";
        obsidianWikilinkTarget: "obsidianWikilinkTarget";
    }
}
