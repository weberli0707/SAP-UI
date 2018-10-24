sap.ui.define([
	"sap/ui/core/util/MockServer",
	"./MockRequests",
	"jquery.sap.xml"
], function() {
	"use strict";
	
	var oMockServer,
		_sAppModulePath="sap/ui/demoapps/rta/freestyle/",
		_sJsonFileModulePath = _sAppModulePath + "localService/mockdata";
	
	return {
		init:function(fnGetManifestEntry){
			var oUriParameters = jQuery.sap.getUriParameters(),
				sJsonFileUrl = jQuery.sap.getModulePath(_sJsonFilesModulePath),
				sEntity = "SEPMRA_C_PD_Product",
				sErrorParam = oUriParameters.get("errorType"),
				iErrorCode = sErrorParam === "badRequest" ? 400:500,
				oMainDataSource = fnGetManifestEntry("sap.app").dataSources.mainService,
				sMetadataUrl = /.*\/$/.test(oMainDataSource.uri) ? oMainDataSource.uri : oMainDataSource.uri + "/",
				oMainAnnotations = fnGetManifestEntry("sap.app").dataSources.mainAnnotations,
				sAnnotations = jQuery.sap.serializeXML(jQuery.sap.sjax({
					url:jQuery.sap.getModulePath(_sAppModulePath + oMainAnnotations.settings.localUri.replace(".xml",""),".xml"),
					dataType:"xml"
				}).data)
		},
		
		getMockServer:function(){
			return oMockserver;
		}
	};
});