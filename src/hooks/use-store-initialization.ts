import { useEffect } from "react";
import { useProblemsStore } from "@/store/problems-store";

/**
 * A hook to initialize the problems store from IndexedDB.
 * @returns boolean - true if the store has finished loading (or was already loaded).
 */
export function useStoreInitialization() {
  const initializeStore = useProblemsStore((state) => state.initializeStore);
  const isInitialized = useProblemsStore((state) => state.isInitialized);

  useEffect(() => {
    // initializeStore handles its own isInitialized check internally,
    // but we call it here to ensure the process starts on mount.
    initializeStore();
  }, [initializeStore]);

  return isInitialized;
}
