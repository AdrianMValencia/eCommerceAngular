export interface BaseResponse<T> {
  isSuccess: boolean;
  data: T;
  message: string;
  errors: BaseError[] | null;
}

export interface BaseError {
  propertyName: string;
  errorMessage: string;
}
