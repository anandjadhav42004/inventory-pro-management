sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, Filter, FilterOperator, Spreadsheet, JSONModel) {
    "use strict";

    return Controller.extend("z_inventory_app.controller.Admin", {

        onInit: function () {
            // 1. Pehle check karo ki kya LocalStorage mein pehle se data hai?
            var sStoredData = localStorage.getItem("myInventoryData");
            var oData;

            if (sStoredData) {
                // Agar data mila, toh wahi use karo
                oData = JSON.parse(sStoredData);
            } else {
                // Agar pehli baar chal raha hai, toh ye Default data use karo
                oData = {
                    Items: [
                        { ID: "INV-5001", Name: "MacBook Air M2", Category: "Electronics", Warehouse: "Section-A", Qty: 25, Price: 1200, Status: "In Stock", State: "Success" },
                        { ID: "INV-5002", Name: "Dell UltraSharp", Category: "Electronics", Warehouse: "Section-B", Qty: 10, Price: 600, Status: "In Stock", State: "Success" },
                        { ID: "INV-5003", Name: "Logitech MX Master", Category: "Accessories", Warehouse: "Section-A", Qty: 0, Price: 100, Status: "Out of Stock", State: "Error" }
                    ],
                    ChartData: [],
                    TotalCount: 0, LowStockCount: 0, OutOfStockCount: 0
                };
            }

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "inventory");
            this._updateKPIs();
        },

        // --- NEW HELPER: DATA KO PERMANENT SAVE KARNE KE LIYE ---
        _saveToLocalStorage: function() {
            var oModel = this.getView().getModel("inventory");
            var oData = oModel.getData();
            // Browser ki storage mein save kar do
            localStorage.setItem("myInventoryData", JSON.stringify(oData));
        },

        onSaveProduct: function () {
            var oModel = this.getView().getModel("inventory");
            var aItems = oModel.getProperty("/Items");

            var newItem = {
                ID: this.byId("idInput").getValue(),
                Name: this.byId("nameInput").getValue(),
                Warehouse: this.byId("whInput").getSelectedKey(),
                Qty: parseInt(this.byId("qtyInput").getValue() || 0),
                Price: 500,
                Category: "General"
            };

            // Logic for status
            if (newItem.Qty === 0) { newItem.Status = "Out of Stock"; newItem.State = "Error"; }
            else if (newItem.Qty < 10) { newItem.Status = "Low Stock"; newItem.State = "Warning"; }
            else { newItem.Status = "In Stock"; newItem.State = "Success"; }

            if (!newItem.ID || !newItem.Name) {
                MessageToast.show("ID and Name are required!");
                return;
            }

            aItems.push(newItem);
            oModel.setProperty("/Items", aItems);

            this._updateKPIs();
            this._saveToLocalStorage(); // <--- SAVE TO BROWSER STORAGE

            MessageToast.show("Product Saved Permanently!");
            this.onCloseDialog();
        },

        onDeleteSelected: function() {
            var oTable = this.byId("adminTable");
            var aSelectedItems = oTable.getSelectedItems();
            var oModel = this.getView().getModel("inventory");
            var aItems = oModel.getProperty("/Items");

            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select items to delete");
                return;
            }

            MessageBox.confirm("Delete " + aSelectedItems.length + " items?", {
                onClose: function(sAction) {
                    if (sAction === "OK") {
                        // Reverse loop use karte hain delete ke liye safety ke liye
                        for (var i = aSelectedItems.length - 1; i >= 0; i--) {
                            var sPath = aSelectedItems[i].getBindingContextPath();
                            var iIndex = parseInt(sPath.split("/").pop());
                            aItems.splice(iIndex, 1);
                        }
                        
                        oModel.setProperty("/Items", aItems);
                        this._updateKPIs();
                        this._saveToLocalStorage(); // <--- SAVE AFTER DELETE
                        oTable.removeSelections();
                        MessageToast.show("Deleted!");
                    }
                }.bind(this)
            });
        },

        // Quantity change hone par bhi save hona chahiye
       onQtyChange: function(oEvent) {
    // 1. Get the changed quantity and the item's context
    var iNewQty = parseInt(oEvent.getParameter("value"));
    var oStepInput = oEvent.getSource();
    var oContext = oStepInput.getBindingContext("inventory");
    var sPath = oContext.getPath();
    var oModel = this.getView().getModel("inventory");

    // 2. Logic to determine Status and Color State
    var sStatus, sState;

    if (iNewQty === 0) {
        sStatus = "Out of Stock";
        sState = "Error";    // Red color
    } else if (iNewQty > 0 && iNewQty < 10) {
        sStatus = "Low Stock";
        sState = "Warning";  // Orange color
    } else {
        sStatus = "In Stock";
        sState = "Success";  // Green color
    }

    // 3. Update the specific item in the model
    oModel.setProperty(sPath + "/Status", sStatus);
    oModel.setProperty(sPath + "/State", sState);

    // 4. Update Dashboard Numbers and Permanent Storage
    this._updateKPIs();
    this._saveToLocalStorage();
    
    sap.m.MessageToast.show("Stock updated for " + oModel.getProperty(sPath + "/Name"));
},

        _updateKPIs: function() {
    var oModel = this.getView().getModel("inventory");
    var aItems = oModel.getProperty("/Items");

    // 1. Dashboard Numbers (Total, Low, Out)
    var iTotal = aItems.length;
    var iLow = aItems.filter(x => x.Qty > 0 && x.Qty < 10).length;
    var iOut = aItems.filter(x => x.Qty === 0).length;

    oModel.setProperty("/TotalCount", iTotal);
    oModel.setProperty("/LowStockCount", iLow);
    oModel.setProperty("/OutOfStockCount", iOut);

    // 2. CHART LOGIC: Grouping by Warehouse Section
    // Hum har section ki total quantity calculate karenge
    var iQtySecA = 0, iQtySecB = 0, iQtySecC = 0;

    aItems.forEach(function(item) {
        if (item.Warehouse === "Section-A") iQtySecA += parseInt(item.Qty || 0);
        if (item.Warehouse === "Section-B") iQtySecB += parseInt(item.Qty || 0);
        if (item.Warehouse === "Section-C") iQtySecC += parseInt(item.Qty || 0);
    });

    // Chart ko data bhejna (Value and Color)
    var aChartData = [
        { Section: "Section-A", Value: iQtySecA, Color: "Good" },     // Blue/Green
        { Section: "Section-B", Value: iQtySecB, Color: "Critical" }, // Orange
        { Section: "Section-C", Value: iQtySecC, Color: "Error" }     // Red
    ];

    oModel.setProperty("/ChartData", aChartData);
},

        // Search, Export and Dialog logic remains same...
        onOpenAddDialog: function () {
            if (!this._pDialog) {
                this._pDialog = this.loadFragment({ name: "z_inventory_app.view.AddProduct" });
            }
            this._pDialog.then(function(oDialog) { oDialog.open(); });
        },
        onCloseDialog: function () {
            this.byId("idInput").setValue("");
            this.byId("nameInput").setValue("");
            this._pDialog.then(function(oDialog) { oDialog.close(); });
        },
        onSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oFilter = new Filter("Name", FilterOperator.Contains, sQuery);
            this.byId("adminTable").getBinding("items").filter([oFilter]);
        }
    });
});