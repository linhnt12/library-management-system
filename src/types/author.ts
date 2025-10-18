export interface Author {
  id: number;
  fullName: string;
  bio?: string;
  birthDate?: Date;
  nationality?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
