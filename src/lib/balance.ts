import {TransactionRepository} from '../repositories';

export async function balance(
  repo: TransactionRepository,
  sin: number,
): Promise<number> {
  // TODO(aeremin): Should we optimise it by doing SQL summation instead.
  const transactions_from = await repo.find({where: {sin_from: {eq: sin}}});
  const transactions_to = await repo.find({where: {sin_to: {eq: sin}}});
  return (
    transactions_to.reduce((accumulator, t) => accumulator + t.amount, 0) -
    transactions_from.reduce((accumulator, t) => accumulator + t.amount, 0)
  );
}
