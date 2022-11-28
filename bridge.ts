import EventEmitter from "events"
import TypedEmitter from "typed-emitter"
import { BridgeEvents } from "./events/BridgeEvents"

export const bridgeEmitter = new EventEmitter() as TypedEmitter<BridgeEvents>
