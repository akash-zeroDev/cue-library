
async function test() {
  const dodoApiKey = process.env.DODO_PAYMENTS_API_KEY;
  const productId = process.env.DODO_PRODUCT_ID;

  if (!dodoApiKey) throw new Error('No API key');

  const requestBody = {
    product_cart: [
      {
        product_id: productId,
        quantity: 1,
        amount: 9900
      }
    ],
    return_url: "http://localhost:5173/#/",
    metadata: {
      user_id: "test_user_id",
      prompt_id: "cue001"
    }
  };

  const response = await fetch('https://test.dodopayments.com/checkouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${dodoApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Response:', text);
}

test().catch(console.error);
