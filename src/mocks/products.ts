import type { Product } from '@/types/storefront';

const PLACEHOLDER = (seed: number) =>
  `https://picsum.photos/seed/burger${seed}/400/300`;

function branchProducts(
  branchId: string,
  prefix: string,
  offset: number,
): Product[] {
  const combos = `cat-combos-${prefix}`;
  const boxes = `cat-boxes-${prefix}`;
  const snacks = `cat-snacks-${prefix}`;
  const condiments = `cat-condiments-${prefix}`;

  return [
    {
      id: `prod-outlaw-${prefix}`,
      branchId,
      categoryId: combos,
      name: 'Outlaw Zinger',
      description: 'Premium crispy chicken fillet, cheese, spicy mayo.',
      imageUrl: PLACEHOLDER(offset + 1),
      isPopular: true,
      isBestSeller: true,
      servingText: 'Serves 1 person',
      variants: [{ id: `v-outlaw-${prefix}`, name: 'Regular', price: 790 }],
    },
    {
      id: `prod-zinger-${prefix}`,
      branchId,
      categoryId: combos,
      name: 'Zinger Butcher',
      description: 'Crispy chicken fillet with fresh lettuce and mayo.',
      imageUrl: PLACEHOLDER(offset + 2),
      isPopular: true,
      variants: [
        { id: `v-zinger-reg-${prefix}`, name: 'Regular', price: 650 },
        { id: `v-zinger-dbl-${prefix}`, name: 'Double', price: 950 },
      ],
    },
    {
      id: `prod-double-${prefix}`,
      branchId,
      categoryId: combos,
      name: "Abraham's Double Stack",
      description: 'Two crispy fillets with double cheese.',
      imageUrl: PLACEHOLDER(offset + 3),
      isBestSeller: true,
      variants: [{ id: `v-double-${prefix}`, name: 'Regular', price: 890 }],
    },
    {
      id: `prod-family-${prefix}`,
      branchId,
      categoryId: boxes,
      name: 'Family Meals',
      description: 'Bucket of 8 pcs chicken with sides and drinks.',
      imageUrl: PLACEHOLDER(offset + 4),
      isPopular: true,
      isBestSeller: true,
      servingText: 'Serves 4-6 people',
      variants: [{ id: `v-family-${prefix}`, name: 'Combo', price: 2450 }],
    },
    {
      id: `prod-duo-${prefix}`,
      branchId,
      categoryId: boxes,
      name: 'Duo Box',
      description: 'Two burgers, fries and drinks combo.',
      imageUrl: PLACEHOLDER(offset + 5),
      isPopular: true,
      servingText: 'Serves 2 persons',
      variants: [{ id: `v-duo-${prefix}`, name: 'Combo', price: 790 }],
    },
    {
      id: `prod-bucket-${prefix}`,
      branchId,
      categoryId: boxes,
      name: 'Crispy Chicken Bucket',
      description: '8 pc crispy chicken with signature seasoning.',
      imageUrl: PLACEHOLDER(offset + 6),
      isBestSeller: true,
      servingText: 'Serves 2-3 persons',
      variants: [{ id: `v-bucket-${prefix}`, name: '8 pc', price: 1290 }],
    },
    {
      id: `prod-fries-${prefix}`,
      branchId,
      categoryId: snacks,
      name: 'Regular Fries',
      description: 'Golden seasoned fries.',
      imageUrl: PLACEHOLDER(offset + 7),
      variants: [{ id: `v-fries-${prefix}`, name: 'Regular', price: 250 }],
    },
    {
      id: `prod-pepsi-${prefix}`,
      branchId,
      categoryId: snacks,
      name: 'Pepsi Regular',
      description: 'Chilled soft drink.',
      imageUrl: PLACEHOLDER(offset + 8),
      variants: [{ id: `v-pepsi-${prefix}`, name: 'Regular', price: 180 }],
    },
    {
      id: `prod-ranch-${prefix}`,
      branchId,
      categoryId: condiments,
      name: 'Creamy Ranch',
      description: 'Signature ranch dip.',
      imageUrl: PLACEHOLDER(offset + 9),
      variants: [{ id: `v-ranch-${prefix}`, name: 'Regular', price: 90 }],
    },
    {
      id: `prod-garlic-${prefix}`,
      branchId,
      categoryId: condiments,
      name: 'Garlic Sauce',
      description: 'Signature garlic dip.',
      imageUrl: PLACEHOLDER(offset + 10),
      variants: [{ id: `v-garlic-${prefix}`, name: 'Regular', price: 90 }],
    },
  ];
}

export const mockProducts: Product[] = [
  ...branchProducts('branch-downtown', 'dt', 0),
  ...branchProducts('branch-mall', 'mall', 20),
  ...branchProducts('branch-airport', 'airport', 40),
];

export const mockHeroProduct = {
  title: 'SIGNATURE OUTLAW BURGER',
  subtitle: 'HONEY HEAT WITH A HINT OF SALT & PEPPER',
  description:
    'Perfectly grilled chicken with rich garlic butter and cracked black pepper.',
  imageUrl: PLACEHOLDER(99),
};
