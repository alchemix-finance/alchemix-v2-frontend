# Alchemix V2 UI

Repository for the v2 UI of Alchemix.

## Setup

```bash
git clone https://github.com/alchemix-finance/alchemix-v2-frontend
cd alchemix-v2-frontend
cp .env.demo .env
yarn install
```

Fill the `.env` file with the required secrets.

Start local development server using `yarn dev` to fetch latest contract artifacts, or use `yarn dev:noabi` to skip
that.

The app should be accessible on [localhost:5005](http://localhost:5005) by default.

## Contributing

### Branches

This repository is using two main branches for deployments:

- The [production deployment](https://alchemix.fi/) is built using `prod` branch codebase
- The [staging deployment](https://staging.alchemix.fi/) is built using `staging` branch codebase

New branches, when pushed, will also be built using our Vercel CI/CD pipeline, so minimize unneccessary pushes to
tracked branches.

In general the process to contribute to the codebase looks like this:

- Find [issue](https://github.com/alchemix-finance/alchemix-v2-frontend/issues) or new feature you want to work on
- Branch off of `staging` and use that as your working branch
- Once ready, a pull request is supposed to be opened to merge your branch into `staging`

With the next deployment cycle, `staging` and all changes in it will be merged into `prod`.

Use descriptive language in your commit messages. Nobody likes to chase down changes to understand what is supposed to
be changed.

### Codestyle

To make it easier for all contributors, please respect the codestyle rules.

**Note:** this requires you to have done the steps in `Setup` first.

#### Webstorm

Open Webstorm settings and navigate to `Preferences/Languages & Frameworks/JavaScript/Prettier`, select the Prettier
install from the local `node_modules` directory, add `svelte` to the glob pattern and enable `Run on save for files`.

Source: [prettier.io docs](https://prettier.io/docs/en/webstorm.html)

#### VS Code

##### Using Svelte extension (recommended)

Install the `svelte-vscode` extension either through the marketplace, or by using the quick open command and
pasting `ext install JamesBirtles.svelte-vscode`. Make sure VS Code settings includes

```json
{
  "[svelte]": {
    "editor.defaultFormatter": "svelte.svelte-vscode"
  }
}
```

Source: [svelte-vscode marketplace](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)

##### Using Prettier extension

Install the `prettier-vscode` extension either through the marketplace, or by using the quick open command and
pasting `ext install esbenp.prettier-vscode`. Make sure VS Code settings includes

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

You may also adjust that setting on a per language basis.

Source: [prettier-vscode Github](https://github.com/prettier/prettier-vscode)
