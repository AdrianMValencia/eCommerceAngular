export interface BaseError {
  propertyName?: string;
  errorMessage?: string;
}

export interface BaseResponse<T> {
  isSuccess: boolean;
  data?: T | null;
  message?: string;
  errors?: BaseError[] | null;
}
