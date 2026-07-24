export abstract class BaseRepository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract list(limit: number, offset: number): Promise<T[]>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<boolean>;
}
