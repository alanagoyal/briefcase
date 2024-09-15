### Installation
```bash
git clone https://github.com/alanagoyal/briefcase
cd briefcase
```

### Dependencies

#### Braintrust
This project uses Braintrust to store prompts, log responses, and run evaluations. You can sign up for a free account [here](https://braintrust.dev/). TODO: setup script

#### OpenAI
This project uses OpenAI's API to generate responses to user prompts. You can sign up for an API key [here](https://openai.com/api/).

#### Stripe
This project uses Stripe to handle payments. You can sign up for an API key [here](https://stripe.com/).

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
```
npx freestyle build
npx freestyle login
npx freestyle deploy
```
