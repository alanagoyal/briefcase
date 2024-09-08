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

#### Quetzal
This project uses Quetzal for translations. You can sign up for free and get an API key [here](https://quetzal.dev/).

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
BRAINTRUST_API_KEY='<your-braintrust-api-key>'
OPENAI_API_KEY='<your-openai-api-key>'
QUETZAL_API_KEY='<your-quetzal-api-key>'
```

### Create Braintrust Functions
TODO

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
