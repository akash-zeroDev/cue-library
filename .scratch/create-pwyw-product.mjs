import DodoPayments from 'dodopayments';

async function main() {
  const client = new DodoPayments({
    bearerToken: 'iyfLOpWMPKGeFzXl.N53o-GXR-VlKQpihOTZ9GyyzFeSMYTnmHH_XMm9b-8rRpfNz',
  });

  try {
    const product = await client.products.create({
      name: 'Cue Premium Component',
      tax_category: 'digital_products',
      price: {
        type: 'one_time_price',
        currency: 'USD',
        price: 100, // minimum $1.00
        pay_what_you_want: true,
        purchasing_power_parity: false,
        discount: 0
      },
    });
    console.log('Product created successfully!');
    console.log('Product ID:', product.product_id);
  } catch (err) {
    console.error('Error creating product:', err);
  }
}

main();
