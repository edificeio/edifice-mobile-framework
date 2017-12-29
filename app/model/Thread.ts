import { Mix } from "entcore-toolkit"
import HTMLParser from "fast-html-parser"
import { Conf } from "../Conf"
import { WebViewCSS } from "../styles/ReadMail"
import { Mail } from "./Mail"

export class Thread {
	public id: string
	public mails: Mail[] = []
	public author: {
		userId: string
		name: string
	}
	public excerpt: string

	constructor(mailId: string) {
		this.mails
	}

	get html(): string {
		const scrollJs = `
            <script>
                var interval;
                var scrollToBottom = function(){
                    window.scrollTo(0, document.body.scrollHeight);
                };
                window.onscroll = function(){
                    clearInterval(interval);
                };
                interval = setInterval(scrollToBottom, 50);
            </script>
        `
		let html = `<!DOCTYPE html /><html><head><style>${WebViewCSS}</style></head><body>`
		for (let i = 0; i < this.mails.length; i++) {
			html += `<div class="message">${this.mails[i].body}</div>`
		}
		html += `${scrollJs}</body></html>`
		return html
	}

	public addMail(mail: Mail) {
		if (this.mails.find(m => m.id === mail.id)) {
			return
		}
		this.mails.push(Mix.castAs(Mail, mail))
	}

	public temporarySendImage(uri: string, webView: any) {
		this.addMail(
			Mix.castAs(Mail, {
				body: `<div class="mobile-app-image"><img src="${uri}" /></div>`,
				id: "temp",
			})
		)
	}

	public async sendImage(imagePath: string) {
		console.log("sending image")
		const mail = {
			body: `<div><img src="${imagePath}" /></div>`,
			subject: `Re: ${this.mails[0].subject}`,
			to: [this.author.userId],
		} as Mail
		this.addMail(mail)
		const response = await fetch(`${Conf.platform}/conversation/send`, {
			method: "POST",
			body: JSON.stringify(mail),
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			} as any,
		})
		const tempMail = this.mails.find(m => m.id === "temp")
		const data = await response.json()
		tempMail.id = data.id
	}

	public fromJSON(data) {
		const root = HTMLParser.parse(data.body)
		this.excerpt = root.structuredText.replace(/\n/g, " ").substring(0, 100)
		this.author = {
			userId: data.from,
			name: data.displayNames.find(n => n[0] === data.from)[1],
		}
	}
}
