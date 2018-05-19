import { ModelApiInterface, ViewModelApiInterface } from "deus-engine-manager-api";
import { hasMedicViewModel } from "../helpers/view-model-helper";

module.exports = () => {
    return {
        view_medic(api: ViewModelApiInterface, model) {
            if (hasMedicViewModel(model)) return model;
            return undefined;
        }
    }
}

