const sawgrass = function () {
    // nodes = [{id:ID,accessedNodeIds:[]}]

    let instance = {
        nodes: {},
        mergedNodes: {},
        init: function (nodes) {
            this.nodes = {};
            for (let i = 0; i < nodes.length; i++) {
                this.nodes[nodes[i].id] = nodes[i];
            }
            this.mergedNodes = JSON.parse(JSON.stringify(this.nodes));
            while (this.mergeOnce()) {
                console.log('merged');
            }
            //console.log('init done',JSON.stringify(this.nodes));
            //console.log('after merged',JSON.stringify(this.mergedNodes));

            return this;
        },
        mergeOnce: function () {
            let merge_nodes = [];
            for (let node_id in this.mergedNodes) {
                if (!this.mergedNodes.hasOwnProperty(node_id)) continue;
                let base_node = this.mergedNodes[node_id];
                if (base_node.type === 'hidden') continue;
                if (base_node.toNodes.length === 1) {
                    let next_node = this.mergedNodes[base_node.toNodes[0]];
                    if (next_node.fromNodes.length === 1) {
                        //yes, merge them!
                        merge_nodes = [base_node, next_node];
                        break;
                    }
                }
                if (base_node.fromNodes.length === 1) {
                    let prev_node = this.mergedNodes[base_node.fromNodes[0]];
                    if (prev_node.toNodes.length === 1) {
                        //yes, merge them!
                        merge_nodes = [prev_node, base_node];
                        break;
                    }
                }
            }
            if (merge_nodes.length <= 0) return false;
            let merging = {
                id: 'node',
                index: -1,
                type: 'merged',
                fromNodes: merge_nodes[0].fromNodes,
                toNodes: merge_nodes[merge_nodes.length - 1].toNodes,
                contain_nodes: [],
            };
            for (let i = 0; i < merge_nodes.length; i++) {
                merging.id += '_' + merge_nodes[i].id;
                if (merging.index < 0) merging.index = merge_nodes[i].index;
                else if (merging.index > merge_nodes[i].index) {
                    merging.index = merge_nodes[i].index;
                }
                if (merge_nodes[i].type === 'real') {
                    if (merging.contain_nodes.indexOf(merge_nodes[i].id) < 0) {
                        merging.contain_nodes.push(merge_nodes[i].id);
                    }
                } else if (merge_nodes[i].type === 'merged') {
                    for (let j = 0; j < merge_nodes[i].contain_nodes.length; j++) {
                        if (merging.contain_nodes.indexOf(merge_nodes[i].contain_nodes[j]) < 0) {
                            merging.contain_nodes.push(merge_nodes[i].contain_nodes[j]);
                        }
                    }
                }
            }
            this.mergedNodes[merging.id] = merging;
            for (let i = 0; i < merge_nodes.length; i++) {
                //delete this.mergedNodes[merge_nodes[i].id];
                this.mergedNodes[merge_nodes[i].id].type = 'hidden';

                for (let x in this.mergedNodes) {
                    if (!this.mergedNodes.hasOwnProperty(x)) continue;
                    let k = this.mergedNodes[x].toNodes.indexOf(merge_nodes[i].id);
                    if (k >= 0) {
                        this.mergedNodes[x].toNodes.splice(k, 1, merging.id);
                    }
                    let p = this.mergedNodes[x].fromNodes.indexOf(merge_nodes[i].id);
                    if (p >= 0) {
                        this.mergedNodes[x].fromNodes.splice(p, 1, merging.id);
                    }
                }
            }

            console.log('merging', merging);
            console.log('outline', JSON.stringify(this.mergedNodes));

            return true;
        },
        debugPrintMergedNodes: function () {
            console.log('------ MERGED NODES -------');
            for (let node_id in this.mergedNodes) {
                if (!this.mergedNodes.hasOwnProperty(node_id)) continue;
                let node = this.mergedNodes[node_id];
                if (node.type === 'hidden') continue;
                console.log(node);
            }
            console.log('-=---- MERGED NODES -----=-');
        },

        debugParameterForRenderAsSimpleGraph: function () {
            let nodes = [];
            for (let node_id in this.mergedNodes) {
                if (!this.mergedNodes.hasOwnProperty(node_id)) continue;
                let node = this.mergedNodes[node_id];
                if (node.type === 'hidden') continue;
                nodes.push({
                    id: node.id,
                    index: node.index,
                    accessedNodeIds: node.toNodes,
                });
            }
            nodes.sort((a, b) => {
                return (a.index - b.index);
            });
            return nodes;
        }
    };

    return instance.init.apply(instance, arguments);
};

function sawgrassTest() {
    let list = [
        {id: 'node_1', type: 'real', fromNodes: [], toNodes: ['node_2']},
        {id: 'node_2', type: 'real', fromNodes: ['node_1'], toNodes: ['node_3', 'node_6']},
        {id: 'node_3', type: 'real', fromNodes: ['node_2'], toNodes: ['node_4']},
        {id: 'node_4', type: 'real', fromNodes: ['node_3', 'node_7'], toNodes: ['node_5']},
        {id: 'node_5', type: 'real', fromNodes: ['node_4'], toNodes: []},
        {id: 'node_6', type: 'real', fromNodes: ['node_2'], toNodes: ['node_7']},
        {id: 'node_7', type: 'real', fromNodes: ['node_6'], toNodes: ['node_4']},
    ];

    let sawgrassInstance = sawgrass(list);
    //console.log(sawgrassInstance);
    sawgrassInstance.debugPrintMergedNodes();
}

//sawgrassTest();