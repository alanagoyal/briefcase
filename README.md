### Installation
```bash
git clone https://github.com/alanagoyal/briefcase
cd briefcase
```

### Dependencies

#### Braintrust
This project uses Braintrust to store prompts, log responses, and run evaluations. You can sign up for a free account [here](https://braintrust.dev/) and run the following command to set up the prompts:
```bash
npx braintrust push braintrust/ycs24.ts
```

#### OpenAI
This project uses OpenAI's API to generate responses to user prompts. You can sign up for an API key [here](https://openai.com/api/).

#### Stripe
This project uses Stripe to handle payments. You can sign up for a a secret and publishable key [here](https://stripe.com/), set up a subscription product, and retrieve the price id from the dashboard.

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
BRAINTRUST_API_KEY='<your-braintrust-api-key>'
OPENAI_API_KEY='<your-openai-api-key>'
STRIPE_SECRET_KEY='<your-stripe-secret-key>'
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='<your-stripe-publishable-key>'
NEXT_PUBLIC_STRIPE_PRICE_ID='<your-stripe-price-id>'
NEXT_PUBLIC_BASE_URL='<your-base-url>'
```

### Development
```
npx freestyle dev
```

### Deployment
Briefcase is deployed on [Vercel](https://vercel.com)

## License
Licensed under the [MIT License](https://github.com/alanagoyal/briefcase/blob/main/LICENSE.md)
