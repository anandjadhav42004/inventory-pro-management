sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, Filter, FilterOperator, JSONModel) {
    "use strict";

    return Controller.extend("z_inventory_app.controller.User", {

        onInit: function () {
            // 1. Your existing data
            var oData = {
                // Replace the Items array in your onInit with this:
Items: [
    { ID: "INV-5001", Name: "MacBook Air M2", Category: "Electronics", Warehouse: "Section-A", Qty: 25, Price: 1200, Status: "In Stock", State: "Success" },
    { ID: "INV-5002", Name: "Dell UltraSharp", Category: "Electronics", Warehouse: "Section-B", Qty: 10, Price: 600, Status: "In Stock", State: "Success" },
    { ID: "INV-5003", Name: "Logitech MX Master", Category: "Accessories", Warehouse: "Section-A", Qty: 0, Price: 100, Status: "Out of Stock", State: "Error" },
    { ID: "INV-5004", Name: "Ergonomic Chair", Category: "Furniture", Warehouse: "Section-C", Qty: 5, Price: 350, Status: "Low Stock", State: "Warning" },
    { ID: "INV-5005", Name: "iPhone 15 Pro", Category: "Electronics", Warehouse: "Section-A", Qty: 15, Price: 1100, Status: "In Stock", State: "Success" },
    { ID: "INV-5006", Name: "Mechanical Keyboard", Category: "Accessories", Warehouse: "Section-B", Qty: 2, Price: 150, Status: "Low Stock", State: "Warning" }
],
                TotalCount: 0,      // NEW PART: Placeholder for numbers
                LowStockCount: 0,   // NEW PART
                OutOfStockCount: 0  // NEW PART
            };

            var oInventoryModel = new JSONModel(oData);
            this.getView().setModel(oInventoryModel, "inventory");

            // NEW PART: Call the update function so numbers show up immediately on load
            this._updateKPIs();
        },

        // --- NEW HELPER FUNCTION ---
        // This calculates the numbers for the top dashboard
        _updateKPIs: function() {
            var oModel = this.getView().getModel("inventory");
            var aItems = oModel.getProperty("/Items");

            var iTotal = aItems.length;
            var iLowStock = aItems.filter(item => item.Qty > 0 && item.Qty < 10).length;
            var iOutOfStock = aItems.filter(item => item.Qty == 0 || item.Qty == "0").length;

            // Set these new values back into the model
            oModel.setProperty("/TotalCount", iTotal);
            oModel.setProperty("/LowStockCount", iLowStock);
            oModel.setProperty("/OutOfStockCount", iOutOfStock);
        },

        onConfirmAdd: function () {
            var oModel = this.getView().getModel("inventory");
            var aData = oModel.getProperty("/Items");

            // Get values from inputs in your AddDialog fragment
            var newItem = {
                ID: this.byId("inputID").getValue(),
                Name: this.byId("inputName").getValue(),
                Warehouse: this.byId("inputWH").getValue(),
                Qty: parseInt(this.byId("inputQty").getValue()), // Ensure it's a number
                Status: this.byId("inputQty").getValue() > 0 ? "In Stock" : "Out of Stock",
                State: this.byId("inputQty").getValue() > 0 ? "Success" : "Error"
            };

            aData.push(newItem);
            oModel.setProperty("/Items", aData);

            // NEW PART: Update numbers after adding a new item
            this._updateKPIs(); 

            MessageToast.show("New Asset Saved: " + newItem.Name);
            this.onCloseDialog();
        },
        onSortPrice: function () {
    var oTable = this.byId("inventoryTable");
    var oBinding = oTable.getBinding("items");
    var aSorters = [];
    
    // Toggle Sort: This will sort items by Price
    aSorters.push(new sap.ui.model.Sorter("Price", false)); 
    oBinding.sort(aSorters);
    
    MessageToast.show("Sorted by highest price");
},

onExport: function() {
    MessageToast.show("Exporting to Excel...");
    // Logic for excel export can be added here later
},

        onSearch: function(oEvent){
            var sQuery = oEvent.getParameter("query");
            var aFilters = [];
            if (sQuery && sQuery.length > 0) {
                var oFilter = new Filter("Name", FilterOperator.Contains, sQuery);
                aFilters.push(oFilter); 
            }
            var oContainer = this.byId("inventoryGrid"); 
            var oBinding = oContainer.getBinding("items");
            if (oBinding) { oBinding.filter(aFilters); }
        },

        onOpenAddDialog: function () {
            if (!this._pDialog) {
                this._pDialog = sap.ui.xmlfragment(this.getView().getId(), "z_inventory_app.view.AddDialog", this);
                this.getView().addDependent(this._pDialog);
            }
            this._pDialog.open();
        },

        onCloseDialog: function () {
            this._pDialog.close();
        },
 
        onLogout: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("roleSelection");
            MessageToast.show("Logged out from Staff Portal");
        }
    });
});