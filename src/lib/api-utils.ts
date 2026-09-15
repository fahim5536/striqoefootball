export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
    cursor?: string;
    hasNextPage?: boolean;
    timestamp: string;
  };
}

export const formatResponse = <T>(data: T, meta?: any): ApiResponse<T> => {
  return {
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString()
    }
  };
};

export const formatError = (message: string, code: number = 500): { status: number; body: ApiResponse<null> } => {
  return {
    status: code,
    body: {
      success: false,
      error: message,
      meta: { timestamp: new Date().toISOString() }
    }
  };
};
