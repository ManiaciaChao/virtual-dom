class Helper {
    constructor() { }
    isString(obj) {
        return (typeof obj === "string" || obj.constructor === String) ? true : false;
    }
    isArray(arr) {
        return (arr.constructor === Array) ? true : false;
    }
    /**
     * 
     * @param {Array} array 
     */
    isEmpty(array) {
        return (array.length) ? true : false;
    }
    /**
     * 
     * @param {Array} array1 
     * @param {Array} array2 
     */
    listDiff(array1, array2) {

    }
}

class Vnode {
    /**
     * 
     * @param {String} tagName 
     * @param {Object} props 
     * @param  {...Vnode} children 
     */
    constructor(tagName, props, ...children) {
        if (!tagName)
            throw "need tagName";
        this.tagName = tagName;
        this.props = props;
        this.children = children;
        this.key = null;
    }
    render(key) {
        if (!key && this.key === null) {
            this.key = 0;
        } else if (key) {
            this.key = key;
        }

        let vnode = document.createElement(this.tagName);

        let vnodeArrays = []

        for (let key of Object.keys(this.props)) {
            vnode.setAttribute(key, this.props[key])
        }
        this.children.forEach((child) => {
            if (child instanceof Vnode) {
                console.log(this.key + 1);
                let childVnode = child.render(this.key + 1);
                vnode.appendChild(childVnode);
            } else if (child instanceof Array) {
                child.forEach((grand) => {
                    let childVnode = grand.render(this.key + 1);
                    vnode.appendChild(childVnode);
                });
            } else if (helper.isString(child)) {
                let childVnode = document.createTextNode(child);
                vnode.appendChild(childVnode);
            }
        });
        return vnode;
    }
}

class Patcher {
    constructor() {
        this.NODE = Symbol("NODE");
        this.PROP = Symbol("PROP");
        this.TEXT = Symbol("TEXT");
        this.REOD = Symbol("REOD");
    }
}

class Patch {
    /**
     * 
     * @param {Symbol} type 
     * @param {any} value 
     */
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

class Differ {
    constructor() {
        this.patches = [];
    }

    /**
     * 
     * @param {Vnode} old 
     * @param {Vnode} neo 
     */
    differ(old, neo) {
        let index = 0;
        // let patches = [];
        this.dfs(old, neo, index);
        return this.patches;
    }
    /**
     * 
     * @param {Vnode} old 
     * @param {Vnode} neo 
     */
    dfs(old, neo, index) {
        let patchNow = [];
        console.log(old);
        console.log(neo);
        if (!neo) {
            // Do nothing :)
        } else if (helper.isArray(old) || helper.isArray(neo)) {
            this.diffChildren(old, neo, index);
        } else if (helper.isString(old) && helper.isString(neo)) { // Text Changed
            console.log("isString")
            patchNow.push(new Patch(patcher.TEXT, neo));
        } else if (this.isOriginVnode(old, neo)) { // Same Nodes

            let patchProps = this.diffProps(old.props, neo.props, index);
            if (patchProps) {
                patchNow.push(new Patch(patcher.PROP, patchProps));
            }
            this.diffChildren(old.children, neo.children, index);
        } else if (old !== neo) { // Node's totally different
            patchNow.push(new Patch(patcher.NODE, neo));
        }
        if (helper.isEmpty(patchNow)) {
            // this.patches[this.index] = patchNow;
            this.patches[index] = patchNow;
        }
    }

    diffProps(oldProps, neoProps) {
        let num = 0;
        let key, value;
        let propsPatches = {};

        console.log(oldProps)
        // Props which changed
        Object.keys(oldProps).forEach((key) => {
            value = oldProps[key];
            if (neoProps[key] !== value) {
                propsPatches[key] = neoProps[key];
                num++;
            }
        });

        // Props which are new
        Object.keys(neoProps).forEach((key) => {
            value = neoProps[key];
            if (!oldProps.hasOwnProperty(key)) {
                propsPatches[key] = neoProps[key];
                num++;
            }
        });

        // If properties all are identical
        if (num === 0) {
            return null;
        }

        return propsPatches;
    }

    diffChildren(oldChildren, neoChildren, index, currentPatch) {

        var remain = null;
        var currentIndex = index;
        oldChildren.forEach((child, i) => {
            var neoChild = neoChildren[i];
            currentIndex = (remain && remain.count)
                ? currentIndex + remain.count + 1
                : currentIndex + 1;
            this.dfs(child, neoChild, currentIndex);
            remain = child;
        })
    }

    /**
     * 
     * @param {Vnode} old 
     * @param {Vnode} neo 
     */
    isOriginVnode(old, neo) {
        return (old.tagName === neo.tagName && old.key === neo.key) ? true : false;
    }
}

const helper = new Helper();
const differ = new Differ();
const patcher = new Patcher();

// let root = new Vnode("div", { className: "container" }, new Vnode("div", {}), new Vnode("ul", {}, new Vnode("li", {}), new Vnode("li", {})));
let root1 = new Vnode("div", {}, new Vnode("div", {}), "Hell", [new Vnode("a", {}), new Vnode("b", {})], new Vnode("ul", {}, new Vnode("li", {}), new Vnode("li", {})));
let a = root1.render();

let root2 = new Vnode("div", { class: "container" }, new Vnode("div", {}), "Hello!", [new Vnode("a", {}), new Vnode("b", {})], new Vnode("ul", {}, new Vnode("li", {})));
root2.render();
differ.differ(root1, root2);