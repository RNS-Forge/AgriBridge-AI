export interface JobDefinition<T> {
  name: string;
  handle(data: T): Promise<void>;
}

export function registerJob<T>(job: JobDefinition<T>) {
  console.log(`[Queue Manager] Job registered: ${job.name}`);
}
