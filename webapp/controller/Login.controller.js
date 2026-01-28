sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("z_inventory_app.controller.Login", {
        onLogin: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            
            // Getting Controls
            var oUserField = this.getView().byId("userInput");
            var oPassField = this.getView().byId("passwordInput");

            // Safety Check: Agar controls nahi mile toh console mein bata dega
            if (!oUserField || !oPassField) {
                console.error("Input fields not found! Check your IDs in Login.view.xml");
                MessageToast.show("Technical Error: UI Controls missing.");
                return;
            }

            var sUser = oUserField.getValue().trim().toLowerCase();
            var sPass = oPassField.getValue();

            console.log("Login attempt with:", sUser);

            if (sUser === "admin" && sPass === "1234") {
                MessageToast.show("Welcome Admin!");
                oRouter.navTo("adminDash");
            } else if (sUser === "user" && sPass === "1234") {
                MessageToast.show("Welcome Staff!");
                oRouter.navTo("userDash");
            } else {
                MessageToast.show("Invalid Credentials! (Hint: Use 1234)");
            }
        },
        
        onBack: function () {
            this.getOwnerComponent().getRouter().navTo("roleSelection");
        }
    });
});