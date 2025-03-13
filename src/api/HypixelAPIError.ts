export class HypixelAPIError extends Error {
	constructor(
		private code: number,
		private statusText: string
	) {
		const message = `Hypixel API returned ${code} ${statusText}`
		super(message)
		this.name = "HypixelAPIError"
	}
}
