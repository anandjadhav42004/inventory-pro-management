sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, Device, JSONModel) {
    "use strict";

    return UIComponent.extend("z_inventory_app.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // 1. Super init call karna (Zaroori hai)
            UIComponent.prototype.init.apply(this, arguments);

            // 2. Device Model set karna (Responsive design ke liye)
            var oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.setModel(oDeviceModel, "device");

            // 3. Router initialize karna (TAKI NAVIGATION KAAM KARE)
            this.getRouter().initialize();
        }
    });
});