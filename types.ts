
export interface Participant {
  id: string;
  name: string;
  color: string;
}

export interface WheelState {
  isSpinning: boolean;
  rotation: number;
  winner: Participant | null;
}
