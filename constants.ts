
import { Position } from './types';

export const POSITIONS: Position[] = [
  Position.Teacher,
  Position.ViceDirector,
  Position.Director,
];

export const DRIVE_FOLDER_IDS: Record<Position, string> = {
  [Position.Teacher]: '1zjx4bbiJq8BBeH6sCHeeNZ0GRkXqVGXl',
  [Position.Director]: '1FSiiFZoAIHS9zbV7bx9nKFA-FdnrbeAe',
  [Position.ViceDirector]: '1iCrrrwSRkWFasbozky-7_6iw1kkEv7Jd',
};
