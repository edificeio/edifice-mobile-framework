import { Conf } from "../Conf"

export var appPrefix: string = (window as any).appPrefix

if ((window as any).infraPrefix === undefined) {
	;(window as any).infraPrefix = "infra"
}

export let infraPrefix: string = Conf.platform + "/infra"
export let currentLanguage = ""
