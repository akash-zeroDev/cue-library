import DodoPayments from 'dodopayments';

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
});

async function main() {
  try {
    const payment = await client.payments.create({
      billing: {
        city: 'New York',
        country: 'US',
        state: 'NY',
        street: '123 Broadway',
        zipcode: '10001',
      },
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      productCart: [
        {
          product_id: 'prod_test', // Does it require a predefined product? Let's check API definition.
        }
      ]
    });
    console.log(payment);
  } catch (err) {
    console.error(err);
  }
}

main();
