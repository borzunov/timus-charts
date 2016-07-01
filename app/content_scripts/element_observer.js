const HANDLER_CLASS_PREFIX = 'handler_';

class ElementObserver {
    constructor() {
        this._handlers = [];
        new MutationObserver(mutations => {
            for (const mutation of mutations)
                for (const node of Array.from(mutation.addedNodes)) {
                    if (!(node instanceof Element))
                        continue;
                    this._handlers.forEach((item, i) => {
                        if (node.matches(item.selector) &&
                                !node.classList.contains(HANDLER_CLASS_PREFIX + i)) {
                            // console.log('online ' + item.selector);
                            item.handler(node);
                        }
                    });
                }
        }).observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    }

    forEach(selector, handler) {
        const handlerId = this._handlers.length;
        for (const node of Array.from(document.querySelectorAll(selector))) {
            // console.log('offline ' + selector);
            handler(node);
            node.classList.add(HANDLER_CLASS_PREFIX + handlerId);
        }
        this._handlers.push({ selector, handler });
    }
}
