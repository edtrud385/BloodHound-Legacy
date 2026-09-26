// Applies the Edge Filtering pane to a Cypher statement.
//
// Legacy only swaps the enabled edge list into statements that contain the
// {} placeholder, so most queries (prebuilt, custom, raw and the node info
// links) ignore the pane. filterStatement rewrites the relationship patterns
// of a read-only statement instead:
//
//   -[r:A|B]->   disabled types are dropped from the list
//   -[r*1..]->   untyped patterns are limited to the enabled types
//
// String literals, backtick-quoted names and comments are left untouched,
// and statements that write to the database are never rewritten.

// Relationship type that never exists, used when every type in a pattern is
// disabled so the statement still parses but matches nothing.
export const NO_MATCH_TYPE = '__FILTERED_EDGE__';

const WRITE_CLAUSE = /^(CREATE|MERGE|DELETE|DETACH|SET|REMOVE|DROP|LOAD|FOREACH)$/i;
const IDENT_START = /[A-Za-z_]/;
const IDENT_PART = /[A-Za-z0-9_]/;

// Splits a statement into code and non-code (strings, quoted names,
// comments) so rewriting only ever looks at code.
function tokenize(statement) {
    const parts = [];
    let code = '';
    let i = 0;
    const pushCode = () => {
        if (code) parts.push({ code: true, text: code });
        code = '';
    };
    while (i < statement.length) {
        const c = statement[i];
        const next = statement[i + 1];
        let end = -1;
        if (c === "'" || c === '"' || c === '`') {
            end = i + 1;
            while (end < statement.length && statement[end] !== c) {
                if (statement[end] === '\\' && c !== '`') end++;
                end++;
            }
            end = Math.min(end + 1, statement.length);
        } else if (c === '/' && next === '/') {
            end = statement.indexOf('\n', i);
            if (end === -1) end = statement.length;
        } else if (c === '/' && next === '*') {
            end = statement.indexOf('*/', i + 2);
            end = end === -1 ? statement.length : end + 2;
        }
        if (end === -1) {
            code += c;
            i++;
        } else {
            pushCode();
            parts.push({ code: false, text: statement.slice(i, end) });
            i = end;
        }
    }
    pushCode();
    return parts;
}

function isWriteStatement(parts) {
    return parts.some(
        (part) =>
            part.code &&
            part.text
                .split(/[^A-Za-z]+/)
                .some((word) => WRITE_CLAUSE.test(word))
    );
}

// Rewrites the body of one relationship pattern, e.g. "r:A|B*1..3".
// Returns null when the pattern should be left alone.
function rewritePattern(body, included, enabled) {
    let i = 0;
    const skipSpace = () => {
        while (i < body.length && /\s/.test(body[i])) i++;
    };
    skipSpace();
    const varStart = i;
    if (i < body.length && IDENT_START.test(body[i])) {
        while (i < body.length && IDENT_PART.test(body[i])) i++;
    }
    const variable = body.slice(varStart, i);
    skipSpace();

    if (body[i] !== ':') {
        // untyped: restrict to the enabled types
        return `${variable}:${enabled.join('|')}${body.slice(i)}`;
    }

    const types = [];
    while (body[i] === ':' || body[i] === '|') {
        i++;
        if (body[i] === ':') i++;
        skipSpace();
        const start = i;
        while (i < body.length && IDENT_PART.test(body[i])) i++;
        if (i === start) return null; // something we do not understand
        types.push(body.slice(start, i));
        // step over spaces only when another type follows, so the text
        // after the type list is kept exactly as written
        let j = i;
        while (j < body.length && /\s/.test(body[j])) j++;
        if (body[j] === '|' || body[j] === ':') i = j;
    }

    const kept = types.filter((type) => included[type] !== false);
    if (kept.length === types.length) return null;
    return `${variable}:${
        kept.length ? kept.join('|') : NO_MATCH_TYPE
    }${body.slice(i)}`;
}

function matchingBracket(text, open) {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        if (text[i] === '[') depth++;
        else if (text[i] === ']' && --depth === 0) return i;
    }
    return -1;
}

// Rewrites the relationship patterns in one run of code.
function rewriteCode(text, included, enabled) {
    let out = '';
    let i = 0;
    while (i < text.length) {
        const open = text.indexOf('[', i);
        if (open === -1) break;
        // only a "[" that directly follows "-" (ignoring spaces) opens a
        // relationship pattern; lists and indexing do not
        let back = open - 1;
        while (back >= 0 && /\s/.test(text[back])) back--;
        const close = matchingBracket(text, open);
        if (text[back] !== '-' || close === -1) {
            out += text.slice(i, open + 1);
            i = open + 1;
            continue;
        }
        const body = text.slice(open + 1, close);
        const rewritten = rewritePattern(body, included, enabled);
        out += text.slice(i, open + 1) + (rewritten === null ? body : rewritten);
        i = close;
    }
    return out + text.slice(i);
}

export function filterStatement(statement, included) {
    if (typeof statement !== 'string' || !included) return statement;
    const enabled = Object.keys(included).filter((type) => included[type]);
    const anyDisabled = Object.keys(included).some(
        (type) => included[type] === false
    );
    if (!anyDisabled || enabled.length === 0) return statement;

    const parts = tokenize(statement);
    if (isWriteStatement(parts)) return statement;

    // A pattern's closing "]" is always in code, but a type list can sit
    // next to a string, e.g. -[r:A {name:'x'}]-. Rewrite with the strings
    // masked out so pattern bodies stay intact, then restore them.
    const masks = [];
    const masked = parts
        .map((part) => {
            if (part.code) return part.text;
            masks.push(part.text);
            return `\u0000${masks.length - 1}\u0000`;
        })
        .join('');
    const rewritten = rewriteCode(masked, included, enabled);
    return rewritten.replace(/\u0000(\d+)\u0000/g, (_, n) => masks[n]);
}

// filterStatement with the app's current filter, when "Apply filter to
// every query" is on.
export function filterQuery(statement) {
    if (!appStore.filterAllQueries) return statement;
    return filterStatement(statement, appStore.edgeincluded);
}
