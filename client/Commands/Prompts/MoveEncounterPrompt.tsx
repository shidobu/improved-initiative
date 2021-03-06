import Awesomplete = require("awesomplete");
import React = require("react");
import { AccountClient } from "../../Account/AccountClient";
import { SavedCombatant, SavedEncounter } from "../../Encounter/SavedEncounter";
import { UpdateLegacySavedEncounter } from "../../Encounter/UpdateLegacySavedEncounter";
import { Metrics } from "../../Utility/Metrics";
import { Prompt } from "./Prompt";

export interface MoveEncounterPromptProps {
    encounterName: string;
    folderNames: string[];
}
export interface MoveEncounterPromptState { }

const promptClassName = "p-move-encounter";
const inputClassName = promptClassName + "-input";

export class MoveEncounterPrompt extends React.Component<MoveEncounterPromptProps, MoveEncounterPromptState> {
    private input: HTMLInputElement;
    public componentDidMount() {
        const awesomplete = new Awesomplete(this.input, {
            list: this.props.folderNames,
            minChars: 0
        });
        awesomplete.evaluate();
        awesomplete.open();
        this.input.focus();
    }

    public render() {
        return <span className={promptClassName}>
            Move encounter {this.props.encounterName} to Folder:
            <input ref={i => this.input = i} className={inputClassName} name="folderName" type="text" />
            <button type="submit" className="fa fa-check button"></button>
        </span>;
    }

}

export class MoveEncounterPromptWrapper implements Prompt {
    public InputSelector = "." + inputClassName;
    public ComponentName = "reactprompt";

    private encounterName: string;
    
    constructor(
        private legacySavedEncounter: { Name?: string },
        private moveListingFn: (encounter: SavedEncounter<SavedCombatant>, oldId: string) => void,
        folderNames: string[],
    ) {
        this.encounterName = legacySavedEncounter.Name || "";
        
        this.component = <MoveEncounterPrompt encounterName={this.encounterName} folderNames={folderNames} />;
    }

    public Resolve = (form: HTMLFormElement) => {
        const folderName = form.elements["folderName"].value || "";
        const savedEncounter = UpdateLegacySavedEncounter(this.legacySavedEncounter);
        
        if (savedEncounter.Path == folderName) {
            return;
        }

        const oldId = savedEncounter.Id;
        savedEncounter.Path = folderName;
        savedEncounter.Id = AccountClient.MakeId(savedEncounter.Name, savedEncounter.Path);
        this.moveListingFn(savedEncounter, oldId);
        Metrics.TrackEvent("EncounterMoved", { Path: folderName });
    }

    private component: JSX.Element;
}

