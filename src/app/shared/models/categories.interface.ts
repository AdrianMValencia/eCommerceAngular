export interface Category {
  categoryId: number;
  name: string;
  createDate: string;
  updateDate: string;
}

export interface GetAllCategoriesResponse extends Category {}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  categoryId?: number;
  name: string;
}