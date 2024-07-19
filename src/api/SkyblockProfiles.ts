import { HypixelAPI } from "./HypixelAPI.js";
import { SkyblockProfile } from "./SkyblockProfile.js";

export class SkyblockProfiles {
	readonly profiles: SkyblockProfile[];

	constructor(raw: any, uuid: string, api: HypixelAPI) {
		this.profiles = (raw as any[]).map(
			(profile) => new SkyblockProfile(profile, uuid, api)
		);
	}

	get selected(): SkyblockProfile {
		return (
			this.profiles.find((profile) => profile.selected) ?? this.profiles[0]
		);
	}

	get bingo(): SkyblockProfile {
		const profile = this.profiles.find(
			(profile) => profile.gamemode == "bingo"
		);
		if (profile == null) throw new Error("Profile does not exist.");
		return profile;
	}

	get main(): SkyblockProfile {
		return this.profiles.reduce((prev, cur) =>
			(cur.skyblockLevel ?? 0) > (prev.skyblockLevel ?? 0) ? cur : prev
		);
	}
	
	get(name: string): SkyblockProfile {
		const profile = this.profiles.find(
			(profile) => profile.cuteName.toLowerCase() == name.toLowerCase()
		);
		if (profile == null) throw new Error("Profile does not exist.");
		return profile;
	}

	getByQuery(query: string | undefined): SkyblockProfile {
		const queryLowercase = query?.toLowerCase();
		if (queryLowercase == "bingo") return this.bingo;
		if (queryLowercase == "main") return this.main;
		if (queryLowercase == null) return this.selected;
		return this.get(queryLowercase);
	}
}
