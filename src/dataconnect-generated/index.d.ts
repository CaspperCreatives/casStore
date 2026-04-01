import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddToCartData {
  cartItem_insert: CartItem_Key;
}

export interface AddToCartVariables {
  productId: UUIDString;
  quantity: number;
}

export interface CartItem_Key {
  id: UUIDString;
  __typename?: 'CartItem_Key';
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  email: string;
  passwordHash: string;
}

export interface GetCartData {
  cartItems: ({
    id: UUIDString;
    product?: {
      id: UUIDString;
      name: string;
      description: string;
      price: number;
      imageUrl?: string | null;
    } & Product_Key;
      quantity: number;
  } & CartItem_Key)[];
}

export interface GetProductsData {
  products: ({
    id: UUIDString;
    name: string;
    description: string;
    imageUrl?: string | null;
    price: number;
  } & Product_Key)[];
}

export interface OrderItem_Key {
  id: UUIDString;
  __typename?: 'OrderItem_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface Product_Key {
  id: UUIDString;
  __typename?: 'Product_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface GetProductsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetProductsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetProductsData, undefined>;
  operationName: string;
}
export const getProductsRef: GetProductsRef;

export function getProducts(): QueryPromise<GetProductsData, undefined>;
export function getProducts(dc: DataConnect): QueryPromise<GetProductsData, undefined>;

interface AddToCartRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddToCartVariables): MutationRef<AddToCartData, AddToCartVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddToCartVariables): MutationRef<AddToCartData, AddToCartVariables>;
  operationName: string;
}
export const addToCartRef: AddToCartRef;

export function addToCart(vars: AddToCartVariables): MutationPromise<AddToCartData, AddToCartVariables>;
export function addToCart(dc: DataConnect, vars: AddToCartVariables): MutationPromise<AddToCartData, AddToCartVariables>;

interface GetCartRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCartData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCartData, undefined>;
  operationName: string;
}
export const getCartRef: GetCartRef;

export function getCart(): QueryPromise<GetCartData, undefined>;
export function getCart(dc: DataConnect): QueryPromise<GetCartData, undefined>;

