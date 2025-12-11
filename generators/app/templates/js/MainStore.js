sap.ui.define([
    "mobx"
], function (mobx) {
    "use strict";

    // Destructure makeAutoObservable from the mobx module
    var makeAutoObservable = mobx.makeAutoObservable;

    class MainStore {
        constructor() {
            // === OBSERVABLES ===
            this.mainSwitch = "A";

            this.scenarioA_Switches = {
                s1: false,
                s2: false,
                s3: false
            };

            this.scenarioB_Switches = {
                s1: false,
                s2: false,
                s3: false
            };

            // autoBind: true ensures 'this' is always correct when passing methods around
            makeAutoObservable(this, {}, { autoBind: true });
        }

        // === COMPUTED VALUES ===
        get activeScenarioText() {
            return "Scenario " + this.mainSwitch + " is running";
        }

        get isScenarioA_ConditionMet() {
            // All 3 must be true
            return (
                this.scenarioA_Switches.s1 &&
                this.scenarioA_Switches.s2 &&
                this.scenarioA_Switches.s3
            );
        }

        get isScenarioB_ConditionMet() {
            // At least 2 must be true
            var switches = Object.values(this.scenarioB_Switches);
            var activeCount = switches.filter(function (isOn) { return isOn; }).length;
            return activeCount >= 2;
        }

        get isTrafficLightOn() {
            if (this.mainSwitch === "A") {
                return this.isScenarioA_ConditionMet;
            }
            if (this.mainSwitch === "B") {
                return this.isScenarioB_ConditionMet;
            }
            return false;
        }

        get totalSwitchesOn() {
            var allSwitches = Object.values(this.scenarioA_Switches)
                .concat(Object.values(this.scenarioB_Switches));
            return allSwitches.filter(function (isOn) { return isOn; }).length;
        }

        // === ACTIONS ===
        setMainSwitch(scenario) {
            this.mainSwitch = scenario;
        }

        resetAll() {
            this.scenarioA_Switches = { s1: false, s2: false, s3: false };
            this.scenarioB_Switches = { s1: false, s2: false, s3: false };
        }
    }

    // Return a singleton instance
    return new MainStore();
});