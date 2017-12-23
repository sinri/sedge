const sedge = {
    data: {
        svg_id: '',
        elements: [],
    },
    svg_namespace: "http://www.w3.org/2000/svg",
    init: function (svg_id) {
        this.data.svg_id = svg_id;
    },
    cleanAndDraw: function () {
        //debug
        console.log(this.data.elements);

        let svg_element = document.querySelector("#" + this.data.svg_id);
        //clean
        svg_element.innerHTML = '';
        // draw
        for (let i = 0; i < this.data.elements.length; i++) {
            let element_meta = this.data.elements[i];
            let element = document.createElementNS(this.svg_namespace, element_meta.tag);
            for (let key in element_meta.attributes) {
                if (!element_meta.attributes.hasOwnProperty(key)) continue;
                element.setAttribute(key, element_meta.attributes[key]);
            }
            if (element_meta.text) {
                element.textContent = element_meta.text;
            }
            svg_element.appendChild(element);
        }
    },
    addElement: function (tag, attributes, text) {
        if (tag === 'path') {
            if (!attributes.stroke) {
                attributes.stroke = "black";
            }
            if (!attributes['stroke-width']) {
                attributes['stroke-width'] = "1";
            }
            if (!attributes.fill) {
                attributes.fill = "none";
            }
        }
        this.data.elements.push({
            tag: tag,
            attributes: attributes,
            text: text,
        });
    },
    // advance preset methods
    simpleGraphNodeDistanceHalf: 30,
    simpleGraphRadius: 20,
    renderSimpleGraph: function (node_data_list) {
        this.data.simple_graph = {nodes: {}, edges: [],};
        let nodes = {};
        let edges = [];
        for (let i = 0; i < node_data_list.length; i++) {
            let node_data = node_data_list[i];
            nodes[node_data.id] = {
                id: node_data.id,
                node_index: i + 1,
                x: this.simpleGraphNodeDistanceHalf * 2 * (i + 1),
                y: this.simpleGraphNodeDistanceHalf,
                r: 10,
                text: (node_data.text ? node_data.text : node_data.id),
            };
            //console.log('added',nodes[node_data.id] );
            if (node_data.accessedNodeIds) {
                for (let j = 0; j < node_data.accessedNodeIds.length; j++) {
                    edges.push({
                        source_node_id: node_data.id,
                        target_node_id: node_data.accessedNodeIds[j],
                    });
                }
            }
        }
        this.data.simple_graph = {nodes: nodes, edges: edges};

        let max_x = 0;
        let max_y = 0;

        for (let i = 0; i < this.data.simple_graph.edges.length; i++) {
            let source_node = this.data.simple_graph.nodes[edges[i].source_node_id];
            let target_node = this.data.simple_graph.nodes[edges[i].target_node_id];

            let floor = this.edgeDictOfSimpleGraph.register(source_node.node_index, target_node.node_index);
            //console.log("floor compute: ",source_node.node_index,target_node.node_index,floor);

            if (floor === false) {
                console.log('ERROR!');
            }
            else if (floor === 0) {
                this.addElement('path', {
                    d: 'M' + source_node.x + "," + source_node.y + " L" + target_node.x + "," + target_node.y
                });
                if (max_y < source_node.y) {
                    max_y = source_node.y * 2;
                }
            } else {
                let sx = source_node.x;
                let sy = source_node.y;
                let sr = source_node.r;
                let tx = target_node.x;
                let ty = target_node.y;
                let tr = target_node.r;

                this.addElement('path', {
                    d: 'M' + sx + "," + sy
                    + " Q" + sx + "," + (sy * 1 + sr + (this.simpleGraphRadius) * floor) + " " + (sx * 1 + (sr + this.simpleGraphRadius)) + "," + (sy * 1 + sr + floor * (this.simpleGraphRadius))
                });
                this.addElement('path', {
                    d: 'M' + (sx * 1 + (sr + this.simpleGraphRadius)) + "," + (sy * 1 + sr + floor * (this.simpleGraphRadius))
                    + " L" + (tx * 1 - (sr + this.simpleGraphRadius)) + "," + (ty * 1 + tr + floor * (this.simpleGraphRadius))
                });
                this.addElement('path', {
                    d: 'M' + (tx * 1 - (sr + this.simpleGraphRadius)) + "," + (ty * 1 + tr + floor * (this.simpleGraphRadius))
                    + " Q" + tx + "," + (ty * 1 + tr + floor * (this.simpleGraphRadius)) + " " + tx + "," + ty
                });

                if (max_y < (sy * 1 + sr + floor * (this.simpleGraphRadius))) {
                    max_y = (sy * 1 + sr + floor * (this.simpleGraphRadius)) + 100;
                }
            }


        }

        for (let node_id in this.data.simple_graph.nodes) {
            if (!this.data.simple_graph.nodes.hasOwnProperty(node_id)) continue;
            let node = this.data.simple_graph.nodes[node_id];
            //console.log(node);
            this.addElement('circle', {
                cx: node.x,
                cy: node.y,
                r: node.r,
            });
            max_x += this.simpleGraphNodeDistanceHalf * 2;

            this.addElement('text', {
                x: node.x - 20,
                y: node.y - 15,
                'font-family': "Verdana",
                'font-size': "12",
            }, node.text);
        }

        max_x += 200;

        let svg_element = document.querySelector("#" + this.data.svg_id);
        //svg_element.setAttribute("style","width:"+max_x+"px;height:"+max_y+"px");
        svg_element.setAttribute('width', max_x + "px");
        svg_element.setAttribute('height', max_y + 'px');

        this.cleanAndDraw();
    },
    edgeDictOfSimpleGraph: {
        dict: {},
        isConflicted: function (source, target, floor) {
            //console.log('dict:',this.dict);
            if (!this.dict[floor]) return false;
            for (let i = 0; i < this.dict[floor].length; i++) {
                let item = this.dict[floor][i];
                //console.log('compare conflict',source, target, floor,item);
                if (!(item.target <= source || item.source >= target)) {
                    //console.log('floor conflict!');
                    return true;
                }
            }
            return false;
        },
        /**
         * Try to find floor of line and register
         * @param source
         * @param target
         * @returns int|boolean as floor
         */
        register: function (source, target) {
            if (source >= target) return false;
            let floor = (target - 1 === source) ? 0 : 1;
            while (this.isConflicted(source, target, floor)) {
                floor++;
            }

            if (!this.dict[floor]) {
                this.dict[floor] = [];
            }
            this.dict[floor].push({
                source: source,
                target: target,
            });
            return floor;
        }
    },
};