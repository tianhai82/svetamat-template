# svelte-tailwindcss-template

This is a fork of Svelte's project template to enable usage of Material UI components built on Tailwindcss. Refer to https://github.com/sveltejs/template for more info.

To create a new project based on this template using [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit tianhai82/svetamat-template svelte-app
cd svelte-app
```

_Note that you will need to have [Node.js](https://nodejs.org) installed._

## Get started

Install the dependencies...

```bash
cd svelte-app
yarn
```

...then start [Rollup](https://rollupjs.org):

```bash
yarn run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.