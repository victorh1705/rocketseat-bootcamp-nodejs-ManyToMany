import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found');
    }

    let storedProducts = await this.productsRepository.findAllById(products);

    if (storedProducts.length !== products.length) {
      const notFoundProducts = products.filter(
        value =>
          !storedProducts.find(storedProduct => value.id === storedProduct.id),
      );

      throw new AppError(
        `Products not found: ${JSON.stringify(notFoundProducts)}`,
      );
    }

    const productsWithoutStock = storedProducts.find(
      (value, index) => value.quantity < products[index].quantity,
    );

    if (productsWithoutStock) {
      throw new AppError(
        `Products without stocks: ${JSON.stringify(productsWithoutStock)}`,
      );
    }

    storedProducts = await this.productsRepository.updateQuantity(products);

    const productsToSave = storedProducts.map((value, index) => ({
      product_id: value.id,
      price: value.price,
      quantity: products[index].quantity,
    }));

    const order = await this.ordersRepository.create({
      customer,
      products: productsToSave,
    });

    return order;
  }
}

export default CreateOrderService;
