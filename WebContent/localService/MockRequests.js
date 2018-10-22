sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/util/MockServer"
], function(Object,MockServer) {
	"use strict";
	return Object.extend("sap.ui.demoapps.rta.freestyle.test.service.Request",{
		constructor: function(oMockServer) {
			this._sTestUser = "TestUser";
			this._srvUrl = "/sap/opu/odata/sap/SEPMRA_PROD_MAN";
			this._iLastId = 0;
			this._oMockServer = oMockServer;
			this._initRequestCallbacks();
		},
		
		_initRequestCallbacks:function(){
			this._oMockServer.attachAfter(MockServer.HTTPMETHOD.POST,this.onAddProduct.bind(this),"SEPMRA_C_PD_Product");
			this._oMockServer.attachAfter(MockServer.HTTPMETHOD.DELETE,this.onDeleteProduct.bind(this),"SEPMRA_C_PD_Product");
		},
		
		getRequest:function(){
			return [
				this._mockActivateProduct(),
				this._mockEditProduct(),
				this._mockCopyProduct()
			];
		},
		
		onDeleteProduct:function(oEvt){
			
		},
		
		onAddProduct:function(oEvt){
			var sNewProductId = "EPM" + this._getNewId();
			jQuery.extend(oEvt.getParameter("oEntity"),{
				"Weight": "0.000",
				"WeightUnit": "KGM",
				"OriginalLanguage": "EN",
				"IsActiveEntity": false,
				"HasActiveEntity": false,
				"HasDraftEntity": false,
				//"ProductDraftUUID": "00505691-2EC5-1ED5-B19F-504E2115A825",
				"ActiveProduct": "",
				"ActiveProduct_Text": "",
				"Product": sNewProductId, //"EPM-000260"
				"ProductCategory": "",
				"Price": "0.00",
				"Currency": "USD", //"EUR",
				"Height": "0.00",
				"Width": "0.00",
				"Depth": "0.00",
				"DimensionUnit": "M",
				"ProductPictureURL": "",
				"Supplier": "",
				"ProductBaseUnit": "EA"
			});
			
			this._fixRemoveActiveProductValue(oEvt.getParameter("oEntity"));
			this._createDraftAdminData(oEvt.getParameter("oEntity").ProductDraftUUID);
			this._createProductStock(sNewProductId);
			this._createProductText(oEvt.getParameter("oEntity").ProductDraftUUID);
		},
		
		_fixRemoveActiveProductValue:function(oNewProduct){
			oNewProduct._metadata.id=oNewProduct._metadata.id.replace("/ActiveProduct='(.*)'","ActiveProduct=''");
			
		}
	});
});