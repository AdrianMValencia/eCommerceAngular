export interface BaseApiResponse<T> {
    isSuccess: boolean;
    data: T | null;
    message: string | null;
    errors: string[] | null;
}