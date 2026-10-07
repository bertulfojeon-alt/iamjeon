export function sha256(s: string): string;
export function loadDenylist(): Promise<{ global: Set<string>; classifiedOnly: Set<string> }>;
export function findHits(text: string, list: Set<string>): string[];
