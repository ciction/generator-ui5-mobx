import { makeAutoObservable } from "mobx";

// Interfaces for better type checking
interface SwitchState {
    s1: boolean;
    s2: boolean;
    s3: boolean;
}

export type ScenarioType = "A" | "B";

export class MainStore {
    // === OBSERVABLES ===
    mainSwitch: ScenarioType = "A";

    scenarioA_Switches: SwitchState = {
        s1: false,
        s2: false,
        s3: false,
    };

    scenarioB_Switches: SwitchState = {
        s1: false,
        s2: false,
        s3: false,
    };

    constructor() {
        // autoBind: true ensures 'this' is always correct when passing methods around
        makeAutoObservable(this, {}, { autoBind: true });
    }

    // === COMPUTED VALUES ===
    get activeScenarioText(): string {
        return `Scenario ${this.mainSwitch} is running`;
    }

    get isScenarioA_ConditionMet(): boolean {
        // All 3 must be true
        return (
            this.scenarioA_Switches.s1 &&
            this.scenarioA_Switches.s2 &&
            this.scenarioA_Switches.s3
        );
    }

    get isScenarioB_ConditionMet(): boolean {
        // At least 2 must be true
        const switches = Object.values(this.scenarioB_Switches);
        const activeCount = switches.filter((isOn) => isOn).length;
        return activeCount >= 2;
    }

    get isTrafficLightOn(): boolean {
        if (this.mainSwitch === "A") {
            return this.isScenarioA_ConditionMet;
        }
        if (this.mainSwitch === "B") {
            return this.isScenarioB_ConditionMet;
        }
        return false;
    }

    get totalSwitchesOn(): number {
        const allSwitches = [
            ...Object.values(this.scenarioA_Switches),
            ...Object.values(this.scenarioB_Switches),
        ];
        return allSwitches.filter((isOn) => isOn).length;
    }

    // === ACTIONS ===
    // Note: With MobX + UI5 two-way binding, setters are often optional 
    // because the view updates the observable directly.
    
    setMainSwitch(scenario: ScenarioType) {
        this.mainSwitch = scenario;
    }

    resetAll() {
        this.scenarioA_Switches = { s1: false, s2: false, s3: false };
        this.scenarioB_Switches = { s1: false, s2: false, s3: false };
    }
}

// Singleton export
export const mainStore = new MainStore();