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
			oNewProduct._metadata.id=oNewProduct._metadata.id.replace("/ActiveProduct='(.*)'/","ActiveProduct=''");
			oNewProduct._metadata.uri = oNewProduct._metadata.uri.replace("/ActiveProduct='(.*)'/","ActiveProduct=''");
			for(var prop in oNewProduct){
				if(oNewProduct[prop] && oNewProduct[prop]._deferred && oNewProduct[prop]._deferred.uri){
					oNewProduct[prop]._deferred.uri = oNewProduct[prop]._deferred.replace("/ActiveProduct='(.*)'/","ActiveProduct = ''");
				}
			}
		},
		
		_mockEditProduct: function() {
			return {
				method:"POST",
				path:new RegExp("SEPMRA_C_PD_ProductEdit\\?ProductDraftUUID=guid'(.*)'&ActiveProduct='(.*)'"),
				response:jQuery.proxy(function(oXhr,sDraftUUID,sActiveProduct) {
					
				},this)
			};
		},
		
		_mockActivateProduct:function(){
			return{
				method:"POST",
				path:new RegExp("SEPMRA_C_PD_ProductActivation\\?PorductUUID=(.*)"),
				response:function(oXhr,sUrlParams){
					var sDraftUUID = this._getProdIdFromUrlParam(sUrlParams),
						oProduct = null;
					sDraftUUID = sDraftUUID.substring(5,sDraftUUID.length - 1);
					oProduct = this._buildProductFromDraft(sDraftUUID);
					
					oXhr.respondJSON(200,{},JSON.stringify({
						d:oProduct
					}));
					
					return true;
				}.bind(this)
			};
		},
		
		_buildProductFromDraft:function(sDraftUUID){
			
		},
		
		_getProdIdFromUrlParam:function(sUrlParams){
			var sParams = decodeURIComponent(sUrlParams);
			return sParams;
		},
		
		_getNewId:function(){
			this._iLastId++;
			return this._iLastId.toString();
		},
		
		_getNewUUID:function(){
			return "aaaaaaaa-bbbb-cccc-dddd-" + this._getNewId();
		},
		
		_copyProductText:function(sProductUUID,sProductDraftUUID,bNewProduct,sActiveProduct){
			var aDraftProductTexts = this._oMockServer.getEntitySetData("SEPMRA_C_PD_ProductText"),
				oOriginaProductText = this._findFirst("ActiveProduct",sProductUUID,aDraftProductTexts),
				oDraftProductText = {},
				sDraftPath,sOriginalPath;
			
			jQuery.extend(oDraftProductText,oOriginalProductText);
			oDraftProductText.ProductTextDraftUUID = this._getNewUUID();
			oDraftProductText.ProductDraftUUID = sProductDraftUUID;
			oDraftProductText.IsActiveEntity = false;
			
			if(bNewProduct){
				oDraftProductText.ActiveProduct = "";
				oDraftProductText.HasActiveEntity = false;
				oDraftProductText.SiblingEntity = {};
			} else {
				oDraftProductText.HasActiveEntity = true;
				oOriginalProductText.HasDraftEntiry = true;
			}
			sDraftPath = this._srvUrl + "SEPMRA_C_PD_ProductText(ProductTextDraftUUID=guid)" + oDraftProductText.ProductTextDraftUUID + 
				"',ActiveProduct='" + sActiveProduct + "',ActiveLanguage='EN')";
			sOriginalPath = oOriginalProductText._metadata.uri;
			oDraftProductText._metadata = {
					"id":sDraftPath,
					"type":"SEMRA_PROD_MAN.SEPMRA_C_PD_ProductTextType",
					"uri":sDraftPath
			};
			for(var prop in oDraftProductText){
				if(oDraftProductText[prop] && oDraftProductText[prop]._deferred && oDraftProductText[prop]._deferred.uri){
					oDraftProductText[prop]._deferred.uri = oDraftProductText[prop]._deferred.uri.replace(sOriginalPath,sDraftPath);
				}
			}
			aDraftProductTexts.push(oDraftProductText);
			this._oMockServer.setEntitySetData("SEPMRA_C_PD_ProductText",aDraftProductTexts);
			
			this._createDraftAdminData(oDraftProductText.ProductTextDraftUUID);
		},
		
		_createDraftAdminData : function(oDraftUUID) {
			var aDraftAdminData = this._oMockServer.getEntitySetData("I_DraftAdministrativeData");
			var iNow = (new Date()).getTime();
			aDraftAdminData.push({
				DraftUUID:oDraftUUID,
				DraftEntityType:"SEPMRA_I_PRODUCTWITHDRAFT",
				CreationDateTime:"\/Date(" + iNow + "+0000)\/",
				CreatedByUser:this._sTestUser,
				LastChangeDateTime:"\/Date(" + iNow + "+0000)\/",
				LastChangeByUser:this._sTestUser,
				DraftAccessType:"",
				ProcessingStartDateTime:"\/Date(" + iNow + "+0000)\/",
				InProcessByUser:"",
				DraftIsKeptByUser:false,
				EnqueueStartDateTime:"0.00000000",
				DraftIsCreatedByMe:true,
				DraftIsLastChangedByMe:true,
				DraftIsProcessedByMe:false,
				CreateByUserDescription:"",
				InProcessByUserDescription:"",
				__metadata: {
					"id": "/sap/opu/odata/sap/SEPMRA_PROD_MAN/I_DraftAdministrativeData(guid'" + oDraftUUID + "')",
					"type": "SEPMRA_PROD_MAN.I_DraftAdministrativeDataType",
					"uri": "/sap/opu/odata/sap/SEPMRA_PROD_MAN/I_DraftAdministrativeData(guid'" + oDraftUUID + "')"
				}
			});
			this._oMockServer.setEntitySetData("I_DraftAdministrativeData",aDarftAdminData);
		},
		
		_createProductStock:function(oProductId){
			var aProductStocks = this._oMockServer.getEntitySetData("SEPMRA_C_PD_ProductStock");
			aProductStocks.push({
				Product:oProductId,
				Quantity:"0",
				QuantityUnit:"EA",
				StockAvailability:1,
				__metadata: {
					"id": "/sap/opu/odata/sap/SEPMRA_PROD_MAN/SEPMRA_C_PD_ProductStock('" + oProductId + "')",
					"type": "SEPMRA_PROD_MAN.SEPMRA_C_PD_ProductStockType",
					"uri": "/sap/opu/odata/sap/SEPMRA_PROD_MAN/SEPMRA_C_PD_ProductStock('" + oProductId + "')"
				},
				to_StockAvailability: {
					"__deferred": {
						"uri": "/sap/opu/odata/sap/SEPMRA_PROD_MAN/SEPMRA_C_PD_ProductStock('" + oProductId + "')/to_StockAvailability"
					}
				}
			});
			this._oMockServer.setEntitySetData("SEPMRA_C_PD_ProductStock",aProductStocks);
		},
		
		_createProductText:function(oDraftUUID){
			
		}
	});
});