import { useSyncExternalStore } from "react";
import { getPhosphor, subscribePhosphor, getCrt, subscribeCrt } from "../lib/phosphor";

export const usePhosphor = () => useSyncExternalStore(subscribePhosphor, getPhosphor, () => "green" as const);

export const useCrt = () => useSyncExternalStore(subscribeCrt, getCrt, () => true);
