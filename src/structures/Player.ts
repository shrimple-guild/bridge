import sharp from "sharp"

export class Player {
  constructor(
    readonly uuid: string,
    readonly username: string,
    readonly skinData: string,
    readonly updated: Date
  ) {}

  get skin() {
    const array = new Uint8ClampedArray(Buffer.from(this.skinData, "base64"))
    return sharp(array, {raw: {width: 8, height: 8, channels: 3}})
      .resize(128, 128, { kernel: sharp.kernel.nearest })
      .png()
      .toBuffer()
  }
}
