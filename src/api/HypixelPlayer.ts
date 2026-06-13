export class HypixelPlayer {
	readonly uuid: string
	readonly hypixelName: string
	readonly joined: Date
	readonly lastLogin: Date
	readonly lastLogout: Date
	readonly raw: any
	readonly discordTag?: string

	constructor(raw: any) {
		this.raw = raw
		this.uuid = raw.uuid
		this.hypixelName = raw.displayname
		this.joined = new Date(raw.firstLogin)
		this.lastLogin = raw.lastLogin
		this.lastLogout = raw.lastLogout
		this.discordTag = raw.socialMedia?.links?.DISCORD
	}
}
