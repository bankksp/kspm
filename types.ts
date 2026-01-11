
export enum Position {
  Teacher = 'ครู',
  ViceDirector = 'รองผู้อำนวยการ',
  Director = 'ผู้อำนวยการ',
}

export interface Certificate {
  id: string;
  name: string;
  position: Position;
  fileUrl: string;
  thumbnailUrl: string;
}
