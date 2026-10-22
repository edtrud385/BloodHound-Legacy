import { useEffect, useState } from 'react';

// State for a Node Info panel that shows nodes of one kind: listens for
// nodeClicked, and when a node of `kind` is clicked loads its properties.
// objectid is null while another kind is selected.
const useNodePanel = (kind) => {
    const [visible, setVisible] = useState(false);
    const [objectid, setObjectid] = useState(null);
    const [label, setLabel] = useState(null);
    const [nodeProps, setNodeProps] = useState({});

    useEffect(() => {
        const nodeClickEvent = (type, id) => {
            if (type !== kind) {
                setObjectid(null);
                setVisible(false);
                return;
            }
            setVisible(true);
            setObjectid(id);
            let session = driver.session();
            session
                .run(
                    `MATCH (n:${kind} {objectid: $objectid}) RETURN n AS node`,
                    {
                        objectid: id,
                    }
                )
                .then((r) => {
                    let props =
                        r.records.length > 0
                            ? r.records[0].get('node').properties
                            : {};
                    setNodeProps(props);
                    setLabel(props.name || props.displayname || id);
                })
                .catch((e) => console.log(e))
                .then(() => session.close());
        };
        emitter.on('nodeClicked', nodeClickEvent);
        return () => {
            emitter.removeListener('nodeClicked', nodeClickEvent);
        };
    }, [kind]);

    return { visible, objectid, label, nodeProps };
};

export default useNodePanel;
