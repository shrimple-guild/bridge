import { partyInviteRegex } from '../../utils/reggies.js'
import { nameIsInDb } from '../../utils/skinUtils.js'

export function acceptFraggerInvite(content: string) {
    let match = content.match(partyInviteRegex)
    if (match == null) return null
    let fragger = match?.groups?.name
    if (fragger == null) return null
    if (nameIsInDb(fragger) || fragger === "Xnder_") return `/p join ${fragger}`
}
