import { CreateUserData, CreateUserVariables, GetProductsData, AddToCartData, AddToCartVariables, GetCartData } from '../';
import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise} from '@angular/fire/data-connect';
import { CreateQueryResult, CreateMutationResult} from '@tanstack/angular-query-experimental';
import { CreateDataConnectQueryResult, CreateDataConnectQueryOptions, CreateDataConnectMutationResult, DataConnectMutationOptionsUndefinedMutationFn } from '@tanstack-query-firebase/angular/data-connect';
import { FirebaseError } from 'firebase/app';
import { Injector } from '@angular/core';

type CreateUserOptions = DataConnectMutationOptionsUndefinedMutationFn<CreateUserData, FirebaseError, CreateUserVariables>;
export function injectCreateUser(options?: CreateUserOptions, injector?: Injector): CreateDataConnectMutationResult<CreateUserData, CreateUserVariables, CreateUserVariables>;

export type GetProductsOptions = () => Omit<CreateDataConnectQueryOptions<GetProductsData, undefined>, 'queryFn'>;
export function injectGetProducts(options?: GetProductsOptions, injector?: Injector): CreateDataConnectQueryResult<GetProductsData, undefined>;

type AddToCartOptions = DataConnectMutationOptionsUndefinedMutationFn<AddToCartData, FirebaseError, AddToCartVariables>;
export function injectAddToCart(options?: AddToCartOptions, injector?: Injector): CreateDataConnectMutationResult<AddToCartData, AddToCartVariables, AddToCartVariables>;

export type GetCartOptions = () => Omit<CreateDataConnectQueryOptions<GetCartData, undefined>, 'queryFn'>;
export function injectGetCart(options?: GetCartOptions, injector?: Injector): CreateDataConnectQueryResult<GetCartData, undefined>;
