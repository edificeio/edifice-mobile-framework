import HTMLParser from "fast-html-parser"
import { Conf } from "../Conf"
import {clean} from "../utils/html";

export class HTMLAdaptator {
	root: any;
	originalHTML: string;

	constructor(html) {
		this.root = HTMLParser.parse(clean(html));
		this.originalHTML = html;
	}

	removeAfterFlat(node){
		const newNode = HTMLParser.parse('<div></div>');
		for(let i = 0; i < node.childNodes.length; i++){
			if(node.childNodes[i].tagName === 'hr'){
				break;
			}
			if(node.childNodes[i].childNodes && node.childNodes[i].childNodes.length){
				newNode.appendChild(this.removeAfterFlat(node.childNodes[i]));
			}
			else{
				newNode.appendChild(node.childNodes[i]);
			}
		}
		return newNode;
	}

	removeAfter(queryString) {
		if(this.originalHTML.indexOf('<hr') === -1){
			return this;
		}
		
		this.root = this.removeAfterFlat(this.root);
		return this;
	}

	outerHTML(node) {
		if (node.nodeType === 3) {
			return node.text
		}
		const attributes = Object.keys(node.attributes)
			.map(a => a + '="' + node.attributes[a] + '"')
			.join(" ")
		const children = node.childNodes.map(cn => this.outerHTML(cn))
		return `<${node.tagName || "div"} ${attributes}>${children.join("")}</${node.tagName || "div"}>`
	}

	toImagesArray(size?) {
		if(!size){
			size = '1600x0'
		}
		const paths = [];
		const images = this.root.querySelectorAll("img");
		for (let i = 0; i < images.length; i++) {
			let src = images[i].attributes.src;
			if(src.indexOf('file://') === -1){
				src = Conf.platform + src;
				let split = src.split('?');
				src = split[0] + '?thumbnail=' + size;
			}
			
			paths.push({ uri: src });
		}
		return paths;
	}

	toHTML() {
		return this.outerHTML(this.root);
	}

	toText() {
		return this.root.structuredText.replace(/\u200b/g, '').replace(/[\s\r\n]+$/, '');
	}

	toOneLineText() {
		return this.root.structuredText.replace(/\n/g, " ").substring(0, 100)
	}

	adapt() {
		const images = this.root.querySelectorAll("img")
		for (let i = 0; i < images.length; i++) {
			if (images[i].attributes.src && images[i].attributes.src.startsWith("/")) {
				images[i].attributes.src = Conf.platform + images[i].attributes.src
			}
		}
		const links = this.root.querySelectorAll("a")
		for (let i = 0; i < links.length; i++) {
			if (links[i].attributes.href && links[i].attributes.href.startsWith("/")) {
				links[i].attributes.href = Conf.platform + links[i].attributes.href
			}
		}
		return this
	}
}
export const adaptator = html => {
	const newAdaptator = new HTMLAdaptator(html);
	return newAdaptator;
}
