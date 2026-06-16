// SceneryStack expects browser globals when axon/dot modules load.
import { enableAssert, enableAssertSlow } from "scenerystack/assert";

(globalThis as Record<string, unknown>)["self"] = globalThis;

enableAssert();
enableAssertSlow();
