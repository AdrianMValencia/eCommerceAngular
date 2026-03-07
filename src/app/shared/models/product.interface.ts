export interface Product {
  productId: number;
  name: string;
  code: string;
  description: string;
  urlImage: string;
  price: number;
  createDate: string;
  updateDate: string;
  userId: number;
  categoryId: number;
}

export interface CreateProductRequest {
  name: string;
  code: string;
  description: string;
  urlImage: string;
  price: number;
  userId: number;
  categoryId: number;
}

export interface UpdateProductRequest {
  productId?: number;
  name: string;
  code: string;
  description: string;
  urlImage: string;
  price: number;
  userId: number;
  categoryId: number;
}
