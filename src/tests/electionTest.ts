import ElectionCommandHelper from "../bridge/commands/bridgeCommands/ElectionCommandHelper";
import { sampleElection } from "./election.js";

const response = ElectionCommandHelper.getMayorSummary(sampleElection)
console.log("Sample mayor response:")
console.log(response)

const specialResponse = ElectionCommandHelper.getSpecial("derp")
console.log("Sample \"Derpy\" query response:")
console.log(specialResponse)