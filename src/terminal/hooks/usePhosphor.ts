import { useSyncExternalStore } from "react";
import { getPhosphor, subscribePhosphor } from "../lib/phosphor";

export const usePhosphor = () => useSyncExternalStore(subscribePhosphor, getPhosphor, () => "green" as const);
