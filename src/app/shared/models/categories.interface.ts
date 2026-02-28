export interface GetAllCategoriesResponse {
    categoryId: number;
    name: string;
}

export interface CreateCategoryRequest {
    name: string;
}

export interface UpdateCategoryRequest {
    categoryId: number;
    name: string;
}