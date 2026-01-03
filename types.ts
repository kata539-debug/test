
export interface Participant {
  id: string;
  name: string;
}

export enum ViewMode {
  INPUT = 'input',
  DRAW = 'draw',
  GROUP = 'group'
}

export interface Group {
  id: number;
  name: string;
  members: string[];
}
