# generator-ui5-mobx

> A Yeoman generator to supercharge your UI5 JavaScript and TypeScript apps with MobX state management.

This generator is designed to run **on top of** a standard UI5 TypeScript project (generated via `easy-ui5`). It automatically detects your project language (JS or TS), configures the project with `mobx` and `ui5-mobx`, sets up the necessary tooling (`ui5-tooling-modules`), and injects a fully functional "Traffic Light" demo to help you get started.


## 🚀 Features

* **Dual Support**: Works with both **JavaScript** (`yo easy-ui5 app`) and **TypeScript** (`yo easy-ui5 ts-app`) projects.
* **Dependencies:** Installs `mobx` and `ui5-mobx`.
* **Tooling:** Configures `ui5-tooling-modules` and `ui5-tooling-transpile` for seamless NPM package consumption.
* **Configuration:** Automatically updates `ui5.yaml`, `package.json`, and `tsconfig.json` (if present).
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

This generator works as a "layer" on top of the standard `easy-ui5` templates.

### Step 1: Install Prerequisites
Ensure you have Yeoman and the base generator installed globally:

````bash
npm install -g yo generator-easy-ui5
````
### Step 2: Generate the Base App
Create a new folder for your project and generate a base app. You can choose either the standard JavaScript app or the TypeScript version.

**Option A: JavaScript Project**
```bash
mkdir my-mobx-js-app
cd my-mobx-js-app
yo easy-ui5 app
# Answer prompts to create a basic JS app
```

**Option B: TypeScript Project**
```bash
mkdir my-mobx-ts-app
cd my-mobx-ts-app
yo easy-ui5 ts-app
# Answer prompts to create a basic TS ap
```
### Step 3: Apply the MobX Layer
Run this custom generator on top of the created project. It will automatically detect if `tsconfig.json` exists to determine which templates (JS or TS) to inject.

**Note:** Use the `--force` flag to automatically overwrite the default files (View, Controller, etc.) with the MobX-enhanced versions.

```bash
yo ui5-mobx --force
```

### Step 4: Run the App
The generator will automatically install the new dependencies (npm install is run at the end).

```bash
npm start
```

## 📂 What Changed?
After running the generator, your project will be transformed based on its type:

#### **Shared Changes**
- **ui5.yaml:** Updated with strict middleware order (`ui5-tooling-transpile-middleware`
 `ui5-tooling-modules-middleware`) to ensure NPM packages work correctly.

- **Main.view.xml:** Replaced with a view that binds directly to MobX computed properties (e.g., `{/isTrafficLightOn}`).

#### **JavaScript Projects**
- **webapp/store/MainStore.js:** The single source of truth for your state, using `mobx.makeAutoObservable`.

- **webapp/controller/Main.controller.js:** Updated to import the store and initialize the `MobxModel`. Handles the named export quirks of `ui5-mobx` in JS environments.

#### **TypeScript Projects**
- **webapp/store/MainStore.ts:** The typed source of truth for your state.

- **webapp/controller/Main.controller.ts:** Updated to import `MobxModel` via standard ES module syntax.

- **tsconfig.json:** Added path mapping for `cpro/js/ui5/mobx/*`.

## 🔧 Debugging

#### Add Yeoman dev dependency (already included)
```json
"devDependencies": {
    "yo": "^6.0.0"
}
```

#### .vscode/launch.json congig


```json
{
    // Debug Yeoman Generator
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Debug Yeoman Generator",
            "program": "${workspaceFolder}/node_modules/yo/lib/cli.js",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "args": [
                "ui5-mobx"
            ],
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen",
            "cwd": "YOUR-PROJECT-DIRECTORY-HERE",
        }
    ]
}
```

## ❓ Troubleshooting

- **"Class extends value [object Module] is not a constructor"**
    - Ensure your generator's package.json has "type": "module".

- **"Failed to resolve dependencies... ui5/mobx/MobxModel.js"**
    -  This happens if the transpiler middleware is missing or configured incorrectly. This generator adds `ui5-tooling-transpile` even for JS projects because the `ui5-mobx` library is distributed as TypeScript.
- **"Could not find middleware..."**
    - This usually means node_modules is out of sync. Delete node_modules and package-lock.json and run npm install again manually.