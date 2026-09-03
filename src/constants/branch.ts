/** Tenant-wide catalog / orders — maps to null branch_id in API */
export const MAIN_BRANCH_LABEL = 'Main';

export function cartScopeKey(branchId: string | null): string {
  return branchId ?? 'main';
}

export function isMainBranch(branchId: string | null): boolean {
  return branchId === null;
}

export function productMatchesBranch(
  productBranchId: string | null | undefined,
  selectedBranchId: string | null,
): boolean {
  return (productBranchId ?? null) === selectedBranchId;
}
