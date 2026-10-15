// Adds every relationship type in the connected database to the Edge
// Filtering config (enabled), the same way edge types seen in a drawn graph
// are added. Pathfinding and the {} prebuilt queries only follow edge types
// in that config, so without this an edge type the build does not know about
// (anything newer CE collection adds) is skipped until it has been drawn once.
export async function loadDatabaseEdgeTypes() {
    if (!global.driver) return;
    let session = global.driver.session();
    try {
        let result = await session.run(
            'CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType'
        );
        emitter.emit(
            'edgeTypesSeen',
            result.records.map((record) => record.get(0))
        );
    } catch (e) {
        console.error(e);
    } finally {
        await session.close();
    }
}
