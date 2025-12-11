sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../store/MainStore",
    "cpro/js/ui5/mobx/MobxModel"
], function (Controller, mainStore, MobxModelModule) {
    "use strict";

    return Controller.extend("<%= namespace %>.controller.<%= viewName %>", {

        onInit: function () {
            // 1. Create the MobxModel wrapping our store
            // 'mainStore' is the singleton instance returned from MainStore.js
            // 'MobxModelModule' contains the named exports, we need the class specifically
            var MobxModel = MobxModelModule.MobxModel;
            var model = new MobxModel(mainStore);

            // 2. Bind it to the view (unnamed model = default)
            this.getView().setModel(model);
        },

        onResetAll: function () {
            mainStore.resetAll();
        }
    });
});