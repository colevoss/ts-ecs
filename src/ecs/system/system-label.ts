export type SystemLabel = string;

export function Systemlabel(label: string): SystemLabel {
  return label;
}

let SYSTEM_LABEL = 0;

export function newSystemLabel() {
  const systemLabel = SYSTEM_LABEL.toString();
  SYSTEM_LABEL += 1;
  return systemLabel;
}
