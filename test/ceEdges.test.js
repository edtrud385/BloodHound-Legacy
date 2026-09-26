import assert from 'assert';
import { CE_EDGES, CE_EDGE_GROUPS } from '../src/js/ceEdges';
import { DEFINITIONS } from '../src/components/Modals/HelpTexts/CEEdges';

// Every CE edge listed in the Edge Filtering pane must have a Help definition,
// so right-clicking it opens a description instead of the empty Default panel.
for (const edge of CE_EDGES) {
    const def = DEFINITIONS[edge];
    assert.ok(def, `${edge} has a help definition`);
    assert.ok(
        Array.isArray(def.paras) && def.paras.length > 0,
        `${edge} has explanatory text`
    );
    assert.ok(
        typeof def.slug === 'string' && def.slug.length > 0,
        `${edge} links to a docs page`
    );
}

// No stray definitions for edges that are not CE edges.
for (const key of Object.keys(DEFINITIONS)) {
    assert.ok(CE_EDGES.includes(key), `${key} is a listed CE edge`);
}

const groupEdgeCount = CE_EDGE_GROUPS.reduce(
    (n, g) => n + g.edges.length,
    0
);
assert.strictEqual(
    Object.keys(DEFINITIONS).length,
    groupEdgeCount,
    'every grouped CE edge is defined'
);

console.log(`ceEdges: ${CE_EDGES.length} edge definitions checked`);
