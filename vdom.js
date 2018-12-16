class Differ {
    constructor() { }
    differList(old, neo) {
        let diff = new Array();
        let tmp = new Array();
        old.forEach((value, index) => {
            (neo.includes(value)) ? tmp.push(value) : (diff.push("del " + index));
        });
        neo.forEach((value, index) => {
        });
        return [diff, tmp];
    }
}
const differ = new Differ();
