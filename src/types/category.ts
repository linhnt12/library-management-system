export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
