import Database from "better-sqlite3"
import { VerificationService } from "../../verify/VerificationService.js"

const db = new Database(":memory:")

db.exec(`
  CREATE TABLE verified_members (
    guild_id TEXT NOT NULL,
    discord_id TEXT NOT NULL,
    UNIQUE (guild_id, discord_id)
  );
  CREATE TABLE guild_settings (
    guild_id TEXT PRIMARY KEY NOT NULL,
    verified_role TEXT,
    unverified_role TEXT
  );
`)

describe("GuildVerification", () => {
	let verification: VerificationService

	beforeEach(() => {
		db.exec(`DELETE FROM verified_members`)
		verification = new VerificationService(db)
	})

	test("should add only new members", () => {
		const didAdd = verification.verifyMember("shrimple", "00000")
		expect(didAdd).toBe(true)
		const didAddAgain = verification.verifyMember("shrimple", "00000")
		expect(didAddAgain).toBe(false)
	})

	test("should remove a member", () => {
		verification.verifyMember("shrimple", "00000")
		const didRemove = verification.unverifyMember("shrimple", "00000")
		expect(didRemove).toBe(true)
		const didRemoveAgain = verification.unverifyMember("shrimple", "00000")
		expect(didRemoveAgain).toBe(false)
	})

	test("should show whether a member is verified", () => {
		expect(verification.isVerified("shrimple", "00000")).toBe(false)
		verification.verifyMember("shrimple", "00000")
		expect(verification.isVerified("shrimple", "00000")).toBe(true)
	})

	test("should add verification roles to guild settings", () => {
		verification.setVerificationRoles("shrimple", "unverified", "verified")
		const verifiedRoles = verification.getVerificationRoles("shrimple")
		expect(verifiedRoles?.unverified_role).toBe("unverified")
		expect(verifiedRoles?.verified_role).toBe("verified")
		const nonexistentRoles = verification.getVerificationRoles("not_a_guild")
		expect(nonexistentRoles).toBe(null)
	})
})
