let wrapper = null;

export function set(url) {
    wrapper = function (superclass=null) {
        if (superclass) {
            return class extends superclass {
                static module = new URL(url).pathname;
            };
        }
        else {
            return class {
                static module = new URL(url).pathname;
            };
        }
    };
}

export { wrapper as apply };