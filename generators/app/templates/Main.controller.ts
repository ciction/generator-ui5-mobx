import Controller from "sap/ui/core/mvc/Controller";
import { mainStore } from "../store/MainStore";
// This import path relies on the tsconfig paths mapping we are adding
import { MobxModel } from "cpro/js/ui5/mobx/MobxModel";

/**
 * @namespace <%= namespace %>.controller
 */
export default class <%= viewName %> extends Controller {

  public onInit(): void {
        // 1. Create the MobxModel wrapping our store
        const model = new MobxModel(mainStore);

        // 2. Bind it to the view (unnamed model = default)
        this.getView()?.setModel(model);
    }

    private onResetAll(): void{
        mainStore.resetAll();
    }
}