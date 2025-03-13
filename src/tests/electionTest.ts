import ElectionCommandHelper from "../bridge/commands/bridgeCommands/ElectionCommandHelper.js"
import election from "./data/election-standard.json" assert { type: "json" }
import electionFoxy from "./data/election-foxy.json" assert { type: "json" }

const response = ElectionCommandHelper.getMayorSummary(election)
console.log("Sample mayor response:")
console.log(response)

const specialResponse = ElectionCommandHelper.getSpecial("derp")
console.log('Sample "Derpy" query response:')
console.log(specialResponse)

const foxyResponse = ElectionCommandHelper.getMayorSummary(electionFoxy)
console.log("Sample mayor response with foxy:")
console.log(foxyResponse)
