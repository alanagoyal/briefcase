### installation
```bash
git clone https://github.com/alanagoyal/briefcase
cd briefcase
```

### dependencies

#### braintrust
this project uses braintrust to store prompts, log responses, and run evaluations. you can sign up for a free account [here](https://braintrust.dev/) and run the following command to set up the prompts:
```bash
npx braintrust push braintrust/ycs24.ts
```

#### openai
this project uses openai's api to generate responses to user prompts. you can sign up for an api key [here](https://openai.com/api/).

#### stripe
this project uses stripe to handle payments. you can sign up for a a secret and publishable key [here](https://stripe.com/), set up a subscription product, and retrieve the price id from the dashboard.

```bash
npm install
```

### environment variables

create a `.env` file in the root directory with the following variables:

```bash
BRAINTRUST_API_KEY='<your-braintrust-api-key>'
OPENAI_API_KEY='<your-openai-api-key>'
STRIPE_SECRET_KEY='<your-stripe-secret-key>'
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='<your-stripe-publishable-key>'
NEXT_PUBLIC_STRIPE_PRICE_ID='<your-stripe-price-id>'
NEXT_PUBLIC_BASE_URL='<your-base-url>'
```

### development
```
npx freestyle dev
```

### deployment
briefcase is deployed on vercel and served at [basecase.vc/briefcase](https://basecase.vc/briefcase).

## license
licensed under the [mit license](https://github.com/alanagoyal/briefcase/blob/main/LICENSE.md)
