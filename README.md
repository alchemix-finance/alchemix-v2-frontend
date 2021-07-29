# Alchemix V2 UI

Repository for the v2 UI of Alchemix.

---

## Setup

```bash
git clone https://github.com/alchemix-finance/alchemix-v2-frontend
cd alchemix-v2-frontend
cp .env.demo .env
yarn install
```

Fill the `.env` file with the required secrets.

Start local development server using

```bash
yarn run dev
```

The app should be accessible on [localhost:5000](http://localhost:5000) by default.

---

## Codestyle

**Note:** this requires you to have done the steps in `Setup` first.

### Webstorm

Open Webstorm settings and navigate to `Preferences/Languages & Frameworks/JavaScript/Prettier`, select the Prettier install from the local `node_modules` directory, add `svelte` to the glob pattern and enable `Run on save for files`.

Source: [prettier.io docs](https://prettier.io/docs/en/webstorm.html)

### VS Code

#### Using Svelte extension (recommended)

Install the `svelte-vscode` extension either through the marketplace, or by using the quick open command and pasting `ext install JamesBirtles.svelte-vscode`. Make sure VS Code settings includes

```json
{
  "[svelte]": {
    "editor.defaultFormatter": "svelte.svelte-vscode"
  }
}
```

Source: [svelte-vscode marketplace](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)

#### Using Prettier extension

Install the `prettier-vscode` extension either through the marketplace, or by using the quick open command and pasting `ext install esbenp.prettier-vscode`. Make sure VS Code settings includes 

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

You may also adjust that setting on a per language basis.

Source: [prettier-vscode Github](https://github.com/prettier/prettier-vscode)
