sap.ui.define([ 
	"sap/ui/core/UIComponent", 
	"sap/ui/model/json/JSONModel" 
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