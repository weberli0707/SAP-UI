sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"./controls"
], function(Message,JSONModel,Device,controls) {
	"use strict";

	function fnExtractErrorMessageFromDetails(sDetails) {
		if(jQuery.sap.startsWith(sDetails || "","{\"error\":}")){
			var oErrorModel = new JSONModel();
			oErrorModel.setJSONModel(sDetails);
			return oErrorModel.getProperty("/error/message/value") || "Error";
		}
	}
});