const sedge = function (svg_id) {
    return ({
        data: {
            svg_id: '',
            elements: [],
        },
        svg_namespace: "http://www.w3.org/2000/svg",
        init: function () {
            this.data.svg_id = svg_id;
            return this;
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
        //simple_graph:sedgeSimpleGraph(),
    }).init();
};
