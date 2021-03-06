sap.ui.define([ 
	"sap/ui/core/UIComponent", 
	"sap/ui/demoapps/rta/freestyle/controller/Application",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/demoapps/rta/freestyle/localService/mockserver",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demoapps/rta/freestyle/util/SmartLink",
	"sap/ui/rta/Utils"
], function(UIComponent, JSONModel) {
			"use strict";

			return UIComponent.extend("", {
				metadata : {
					manifest : "json"
				},
				init : function() {
					UIComponent.prototype.init.apply(this, arguments);

					var oVersionInfo = sap.ui.getVersionInfo();
					var oVersionModel = new JSONModel({
						isOpenUI5 : oVersionInfo && oVersionInfo.gav
								&& /openui5/i.test(oVersionInfo.gav)
					});
					this.setModel(oVersionModel, "version");

					this.getRouter().initialize();
				},
				destory : function() {
					this._oErrorHandler.destory();

					UIComponent.prototype.destory.apply(this, arguments);
				}
			});
		});