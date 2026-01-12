// FIX: Resolved a TypeScript declaration conflict by defining the `AIStudio`
// interface within the global scope and applying it to the 'aistudio' property
// on the 'Window' interface. This ensures type consistency across all declarations.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

// By exporting an empty object, we treat this file as a module, which allows
// for the use of `declare global`.
export {};