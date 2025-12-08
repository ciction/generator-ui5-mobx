# MobX Integration (Generated)

This project has been enhanced with `ui5-mobx` for state management.

## 🚦 Traffic Light Demo
A complex state example is included in `MainStore.ts`.
- **Scenario A**: Turns green only if **all 3** switches are ON.
- **Scenario B**: Turns green if **any 2** switches are ON.

## 🛠 Key Files
- **store/MainStore.ts**: The single source of truth. Uses `makeAutoObservable` to track state.
- **controller/View1.controller.ts**: Initializes `ui5-mobx/MobxModel`.
- **manifest.json**: Maps `ui5-mobx` to local resources.
- **ui5.yaml**: Configures `ui5-middleware-servestatic` to serve the NPM packages.

## 📦 Dependencies
- `mobx`: Core state library.
- `ui5-mobx`: SAP UI5 adapter for MobX models.