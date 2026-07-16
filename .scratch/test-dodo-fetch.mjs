
async function test() {
  const apiKey = 'iyfLOpWMPKGeFzXl.N53o-GXR-VlKQpihOTZ9GyyzFeSMYTnmHH_XMm9b-8rRpfNz';
  const response = await fetch('https://live.dodopayments.com/api/v1/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      product_cart: [{ product_id: 'prod_test', quantity: 1, amount: 999 }],
      billing: { city: 'NY', country: 'US', state: 'NY', street: '123 Broadway', zipcode: '10001' },
      customer: { name: 'John Doe', email: 'test@example.com' },
      payment_link: true,
      metadata: { prompt_id: 'cue001', user_id: 'user_123' }
    })
  });
  console.log('Payments status:', response.status);
  console.log(await response.text());
}

test();
