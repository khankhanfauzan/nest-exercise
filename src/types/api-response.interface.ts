export class ApiResponse<T> {
  status: number;
  message: string;
  data?: T | null;
    meta?: Record<string, unknown>;
}
