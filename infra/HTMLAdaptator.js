import HTMLParser from 'fast-html-parser';
import { Conf } from '../src/Conf';
export class HTMLAdaptator {
    constructor(html) {
        this.html = html;
        this.root = HTMLParser.parse(html);
    }
    removeAfter(queryString) {
        const node = this.root.querySelector(queryString);
        for (let i = 0; i < this.root.childNodes.length; i++) {
        }
        return this;
    }
    outerHTML(node) {
        if (node.nodeType === 3) {
            return node.text;
        }
        const attributes = Object.keys(node.attributes).map(a => a + '="' + node.attributes[a] + '"').join(' ');
        const children = node.childNodes.map(cn => this.outerHTML(cn));
        return `<${node.tagName || 'div'} ${attributes}>${children.join('')}</${node.tagName || 'div'}>`;
    }
    toHTML() {
        return this.outerHTML(this.root);
    }
    adapt() {
        const images = this.root.querySelectorAll('img');
        for (let i = 0; i < images.length; i++) {
            if (images[i].attributes.src && images[i].attributes.src.startsWith('/')) {
                images[i].attributes.src = Conf.platform + images[i].attributes.src;
            }
        }
        const links = this.root.querySelectorAll('a');
        for (let i = 0; i < links.length; i++) {
            if (links[i].attributes.href && links[i].attributes.href.startsWith('/')) {
                links[i].attributes.href = Conf.platform + links[i].attributes.href;
            }
        }
        return this;
    }
}
export const adaptator = (html) => {
    const newAdaptator = new HTMLAdaptator(html);
    return newAdaptator;
};
