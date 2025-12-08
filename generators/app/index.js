import Generator from 'yeoman-generator';
import yaml from 'yaml';

export default class extends Generator {
  
  writing() {
    this.log("Configuring MobX, UI5 Tooling Modules, and enforcing Middleware Order...");

    // -------------------------------------------
    // 1. DETECT APP INFO
    // -------------------------------------------
    const manifestPath = this.destinationPath('webapp/manifest.json');
    let appNamespace = "my.app";
    let mainViewName = "View1";

    if (this.fs.exists(manifestPath)) {
        const manifest = this.fs.readJSON(manifestPath);
        if (manifest["sap.app"]?.id) appNamespace = manifest["sap.app"].id;

        if (manifest["sap.ui5"]?.routing) {
            const routes = manifest["sap.ui5"].routing.routes || [];
            const targets = manifest["sap.ui5"].routing.targets || {};
            const defaultRoute = routes.find(r => !r.pattern || r.pattern === "" || r.pattern === ":?query:");
            if (defaultRoute) {
                const targetName = Array.isArray(defaultRoute.target) ? defaultRoute.target[0] : defaultRoute.target;
                if (targets[targetName]) {
                    mainViewName = targets[targetName].viewName || targets[targetName].name || mainViewName;
                }
            }
        }
    }

    // -------------------------------------------
    // 2. COPY TEMPLATES
    // -------------------------------------------
    this.fs.copyTpl(
        this.templatePath('Main.view.xml'),
        this.destinationPath(`webapp/view/${mainViewName}.view.xml`),
        { namespace: appNamespace, viewName: mainViewName }
    );
    this.fs.copyTpl(
        this.templatePath('Main.controller.ts'),
        this.destinationPath(`webapp/controller/${mainViewName}.controller.ts`),
        { namespace: appNamespace, viewName: mainViewName }
    );
    this.fs.copy(
        this.templatePath('MainStore.ts'),
        this.destinationPath('webapp/store/MainStore.ts')
    );
    this.fs.copy(
        this.templatePath('README_MOBX.md'),
        this.destinationPath('README_MOBX.md')
    );

    // -------------------------------------------
    // 3. UPDATE PACKAGE.JSON (Fix Dependencies)
    // -------------------------------------------
    const pkgJsonPath = this.destinationPath('package.json');
    const pkg = this.fs.readJSON(pkgJsonPath) || {};

    // Dependencies
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies["mobx"] = "^6.15.0";
    pkg.dependencies["ui5-mobx"] = "^0.2.3";

    // DevDependencies
    pkg.devDependencies = pkg.devDependencies || {};
    pkg.devDependencies["ui5-tooling-modules"] = "^3.0.0";
    pkg.devDependencies["ui5-tooling-transpile"] = "^3.0.0";
    pkg.devDependencies["ui5-middleware-livereload"] = "^3.0.0";

    // UI5 Dependencies (Critical Step)
    pkg.ui5 = pkg.ui5 || {};
    pkg.ui5.dependencies = pkg.ui5.dependencies || [];
    
    const requiredTools = [
        "ui5-tooling-transpile", 
        "ui5-tooling-modules", 
        "ui5-middleware-livereload"
    ];

    requiredTools.forEach(tool => {
        if (!pkg.ui5.dependencies.includes(tool)) {
            pkg.ui5.dependencies.push(tool);
        }
    });

    this.fs.writeJSON(pkgJsonPath, pkg);

    // -------------------------------------------
    // 4. UPDATE TSCONFIG.JSON
    // -------------------------------------------
    const tsconfigPath = this.destinationPath('tsconfig.json');
    if (this.fs.exists(tsconfigPath)) {
        const tsconfig = this.fs.readJSON(tsconfigPath);
        if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {};
        if (!tsconfig.compilerOptions.paths) tsconfig.compilerOptions.paths = {};
        tsconfig.compilerOptions.paths["cpro/js/ui5/mobx/*"] = ["./node_modules/ui5-mobx/src/cpro/js/ui5/mobx/*"];
        this.fs.writeJSON(tsconfigPath, tsconfig);
    }

    // -------------------------------------------
    // 5. UPDATE UI5.YAML (Enforce Order)
    // -------------------------------------------
    const ui5YamlPath = this.destinationPath('ui5.yaml');
    if (this.fs.exists(ui5YamlPath)) {
      const fileContent = this.fs.read(ui5YamlPath);
      const doc = yaml.parseDocument(fileContent);

      // A. Builder Settings
      if (!doc.has('builder')) doc.set('builder', new yaml.YAMLMap());
      const builder = doc.get('builder');
      
      if (!builder.has('settings')) builder.set('settings', new yaml.YAMLMap());
      const settings = builder.get('settings');
      
      if (!settings.has('includeDependency')) settings.set('includeDependency', new yaml.YAMLSeq());
      const includes = settings.get('includeDependency');
      if (!includes.items.some(i => i.value === 'cpro.js.ui5.mobx')) {
          includes.add('cpro.js.ui5.mobx');
      }

      // B. Custom Tasks
      if (!builder.has('customTasks')) builder.set('customTasks', new yaml.YAMLSeq());
      const tasks = builder.get('customTasks');

      // Helper: Remove existing task to re-add in order
      const removeTask = (name) => {
          tasks.items = tasks.items.filter(i => i.get('name') !== name);
      };
      
      removeTask('ui5-tooling-transpile-task');
      removeTask('ui5-tooling-modules-task');

      // Add Tasks in Order
      const transpileTask = new yaml.YAMLMap();
      transpileTask.set('name', 'ui5-tooling-transpile-task');
      transpileTask.set('afterTask', 'replaceVersion');
      const transpileConfig = new yaml.YAMLMap();
      transpileConfig.set('removeConsoleStatements', true);
      transpileConfig.set('transpileAsync', true);
      transpileConfig.set('transpileTypeScript', true);
      transpileConfig.set('debug', true);
      transpileTask.set('configuration', transpileConfig);
      tasks.add(transpileTask);

      const modulesTask = new yaml.YAMLMap();
      modulesTask.set('name', 'ui5-tooling-modules-task');
      modulesTask.set('afterTask', 'replaceVersion');
      const modulesConfig = new yaml.YAMLMap();
      modulesConfig.set('prependPathMappings', false);
      modulesConfig.set('addToNamespace', true);
      modulesTask.set('configuration', modulesConfig);
      tasks.add(modulesTask);

      // C. Middleware (Strict Order: Livereload -> Transpile -> Modules)
      if (!doc.has('server')) doc.set('server', new yaml.YAMLMap());
      const server = doc.get('server');
      if (!server.has('customMiddleware')) server.set('customMiddleware', new yaml.YAMLSeq());
      const middleware = server.get('customMiddleware');

      // Remove existing to prevent duplicates and fix order
      const removeMiddleware = (name) => {
          middleware.items = middleware.items.filter(i => i.get('name') !== name);
      };
      removeMiddleware('ui5-middleware-livereload');
      removeMiddleware('ui5-tooling-transpile-middleware');
      removeMiddleware('ui5-tooling-modules-middleware');

      // 1. Livereload
      const livereload = new yaml.YAMLMap();
      livereload.set('name', 'ui5-middleware-livereload');
      livereload.set('afterMiddleware', 'compression');
      middleware.add(livereload);

      // 2. Transpile (depends on livereload)
      const transpile = new yaml.YAMLMap();
      transpile.set('name', 'ui5-tooling-transpile-middleware');
      transpile.set('afterMiddleware', 'ui5-middleware-livereload');
      const transpileMiddlewareConfig = transpileConfig.clone(); // Re-use config
      transpileMiddlewareConfig.set('transpileDependencies', true);
      transpile.set('configuration', transpileMiddlewareConfig);
      middleware.add(transpile);

      // 3. Modules (depends on transpile)
      const modules = new yaml.YAMLMap();
      modules.set('name', 'ui5-tooling-modules-middleware');
      modules.set('afterMiddleware', 'ui5-tooling-transpile-middleware');
      middleware.add(modules);

      this.fs.write(ui5YamlPath, doc.toString());
    }
  }

  install() {
    this.log("Installing Dependencies...");
    this.spawnCommandSync('npm', ['install']);
  }
};