sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";
    return Controller.extend("z_inventory_app.controller.RoleSelection", {
        onProceed: function () {
            var sRole = this.getView().byId("roleSelect").getSelectedKey();
            this.getOwnerComponent().getRouter().navTo("login", { role: sRole });
        }
    });
});