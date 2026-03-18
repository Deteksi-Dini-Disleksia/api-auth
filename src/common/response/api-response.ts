export interface ApiResponse<T> {
  responseStatus: boolean;
  responseMessage: string;
  responseBody: T | null;
}

export class ApiResponseUtil {
  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return {
      responseStatus: true,
      responseMessage: message,
      responseBody: data,
    };
  }

  static failed<T>(message = 'Failed'): ApiResponse<T> {
    return {
      responseStatus: false,
      responseMessage: message,
      responseBody: null,
    };
  }
}
