import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    return this.ormRepository.findOne({ where: { name } });
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    return this.ormRepository.findByIds(products.map(value => value.id));
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsToUpdate = await this.ormRepository.findByIds(
      products.map(value => value.id),
    );

    if (productsToUpdate) {
      productsToUpdate.forEach((value, index) => {
        Object.assign(value, { quantity: products[index].quantity });
      });
    }

    await this.ormRepository.save(productsToUpdate);

    return productsToUpdate;
  }
}

export default ProductsRepository;
