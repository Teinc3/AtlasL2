export function parseTargetCodes(targets: string): string[] {
  return [...new Set(targets.split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean))
  ];
}
