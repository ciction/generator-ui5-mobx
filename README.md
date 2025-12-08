# generator-ui5-mobx

> A Yeoman generator to supercharge your UI5 TypeScript apps with MobX state management.

This generator is designed to run **on top of** a standard UI5 TypeScript project (generated via `easy-ui5`). It automatically configures the project with `mobx` and `ui5-mobx`, sets up the necessary tooling (`ui5-tooling-modules`), and injects a fully functional "Traffic Light" demo to help you get started.

## 🚀 Features

* **Dependencies:** Installs `mobx` and `ui5-mobx`.
* **Tooling:** Configures `ui5-tooling-modules` and `ui5-tooling-transpile` for seamless NPM package consumption.
* **Configuration:** Automatically updates `ui5.yaml`, `package.json`, and `tsconfig.json`.
* **Demo Code:** Injects a `MainStore` (state), a reactive `Controller`, and an XML `View` demonstrating complex state logic (Traffic Light example).

## 🛠️ Installation (Local Development)

Since this is a custom local generator, you need to link it to your global NPM modules to make it executable.

1.  Open a terminal in the root of this generator project (where `package.json` is).
2.  Run the following command:

    ```bash
    npm link
    ```

    *You should see output confirming that `generator-ui5-mobx` has been linked globally.*

## 🏃‍♂️ Usage Guide

This generator works as a "layer" on top of the standard `easy-ui5` TypeScript template.

### Step 1: Install Prerequisites
Ensure you have Yeoman and the base generator installed globally:

````bash
npm install -g yo generator-easy-ui5
````
### Step 2: Generate the Base App
Create a new folder for your project and generate a standard TypeScript app.  (Select "ts-app" when prompted)

```bash
mkdir my-mobx-app
cd my-mobx-app
yo easy-ui5 ts-app
```
### Step 3: Apply the MobX Layer
Run this custom generator on top of the created project. Note: Use the --force flag to automatically overwrite the default files (View, Controller, etc.) with the MobX-enhanced versions.

```bash
yo ui5-mobx --force
```

### Step 4: Run the App
The generator will automatically install the new dependencies (npm install is run at the end).

```bash
npm start
```

## 📂 What Changed?
After running the generator, your project will have:

- webapp/store/MainStore.ts: The single source of truth for your state.
- webapp/controller/View1.controller.ts: Updated to initialize the MobxModel. 
- ui5.yaml: Updated with strict middleware order:
- ui5-middleware-livereload
- ui5-tooling-transpile-middleware
- ui5-tooling-modules-middleware
- tsconfig.json: Added path mapping for cpro/js/ui5/mobx/*.

## ❓ Troubleshooting

- **"Class extends value [object Module] is not a constructor"**
    - Ensure your generator's package.json has "type": "module".

- **"Could not find middleware..."**
    - This usually means node_modules is out of sync. Delete node_modules and package-lock.json and run npm install again manually.