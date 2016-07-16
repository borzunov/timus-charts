const ELEMENT_HANDLER_CLASS_PREFIX = 'tc__observer-element-';
const TEXT_HANDLER_CLASS_PREFIX = 'tc__observer-text-';

class ElementObserver {
    static _invokeHandlers(handlers, classPrefix, matchedElement, passedNode) {
        handlers.forEach(({ selector, handler }, i) => {
            if (matchedElement.matches(selector) &&
                    !matchedElement.classList.contains(classPrefix + i))
                handler(passedNode);
        });
    }

    constructor() {
        this._elementHandlers = [];
        this._textHandlers = [];
        new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                Array.from(mutation.addedNodes).forEach(node => {
                    if (node instanceof Element)
                        ElementObserver._invokeHandlers(this._elementHandlers,
                            ELEMENT_HANDLER_CLASS_PREFIX, node, node);
                    else
                    if (node instanceof Text && node.parentElement !== null)
                        ElementObserver._invokeHandlers(this._textHandlers,
                            TEXT_HANDLER_CLASS_PREFIX,
                            node.parentElement, node);
                });
            });
        }).observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    }

    forEach(selector, handler) {
        const handlerId = this._elementHandlers.length;
        for (const el of Array.from(document.querySelectorAll(selector))) {
            handler(el);
            el.classList.add(ELEMENT_HANDLER_CLASS_PREFIX + handlerId);
        }
        this._elementHandlers.push({ selector, handler });
    }

    forEachTextIn(selector, handler) {
        const handlerId = this._textHandlers.length;
        for (const el of Array.from(document.querySelectorAll(selector))) {
            for (const node of el.childNodes)
                if (node instanceof Text)
                    handler(node);
            el.classList.add(TEXT_HANDLER_CLASS_PREFIX + handlerId);
        }
        this._textHandlers.push({ selector, handler });
    }
}
