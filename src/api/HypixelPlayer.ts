export class HypixelPlayer {
  readonly uuid: string
  readonly hypixelName: string
  readonly joined: Date
  readonly status: HypixelStatus
  readonly raw: any
  readonly discordTag?: string

  constructor(raw: any) {
    this.raw = raw
    this.uuid = raw.uuid
    this.hypixelName = raw.displayname
    this.joined = new Date(raw.firstLogin)
    this.status = resolveStatus(raw.lastLogin, raw.lastLogout)
    this.discordTag = raw.socialMedia?.links?.DISCORD
  }
}

type HypixelStatus = { status: "online" } | { status: "offline", lastSeen: Date } | { status: "unknown" }

function resolveStatus(lastLogin: number | undefined, lastLogout: number | undefined): HypixelStatus {
  if (!lastLogin || !lastLogout) {
    return { status: "unknown" }
  } else if (lastLogin > lastLogout) {
    return { status: "online" }
  } else {
    return { status: "offline", lastSeen: new Date(lastLogout)}
  }
}

