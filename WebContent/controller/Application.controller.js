sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"./NavigaionManager",
	"./ODataMetadataLoader",
	"sap/ui/demoapps/rta/freestyle/model/Products"
], function(BaseObject,Device,JSONModel,NavigationManager,Products) {
	"use strict";
	return BaseObject.extend("sap.ui.demoapps.rta.freestyle.controller.Application",{
		init:function(oComponent){
			this._oMainView = oComponent.getAggregation("rootControl");
			var oDeviceModel = new JSONModel();
			oDeviceModel.setDefaultBindingMode("OneWay");
			oComponent.setModel(oDeviceModel,"device");
			this._oApplicationProperties = new JSONModel({
				metaDataLoadState:0,
				isAppBusy:true,
				isMultiSelect:false,
				isListLoading:false,
				listNoDataText:"",
				applicationController:this,
				productId:null,
				draftId:null,
				preferredIds:[],
				masterImmediateBusy:true,
				detailImmediateBusy:true,
				detailInHistory:false,
				isChartDisplay:false
			});
			oComponent.setModel(this._oApplicationProperties,"appProperties");
			
			var fnSetAutomaticUpdate = function(bSetAutomaticUpdate) {
				this._oMasterController.setAutomaticUpdate(true);
			};			
			
			this._oODataHelper = new Products(oComponent, this._oMainView, fnSetAutomaticUpdate.bind(this, true), fnSetAutomaticUpdate.bind(
					this, false));
			
			var oRouter = oComponent.getRouter();
			
			this._oNavigationManger = new NavigationManager(oRouter,this._oApplicationProperties,oComponent.getModel("i18n").getResourceBundle());
			this._oNavigationManger.init(oComponent.getComponentData(),this._oMainView);
			
			this._oODataMetadataLoader = new ODataMetadataLoader(oComponent);
			this._oODataMetadataLoader.init(this._oNavigationManger);
		},
		registerMaster:function(oMasterController){
			this._oMasterController = oMasterController;
			this._oNavigationManger.registerMaster(oMasterController);
		},
		registerDisplay:function(oDisplayController){
			
		},
		registerEdit:function(oEditController){
			
		},
		registerDetailInfo:function(oDetailInfoController){
			
		},
		registerDetailChart:function(oDetailChartController){
			
		},
		displayProduct:function(sProductId,bFromList){
			
		},
		editProductDraft:function(sProductId,sDraftId,bFromList){
			
		},
		navToEmptPage:function(sText,bResetUrl){
			
		},
		navToMaster:function(sId,aPreferredReplace){
			
		},
		navBack:function(bPreferHistory,bFromDetailScreen){
			
		},
		whenMetadataLoaded:function(fnMetadataLoaded,fnNoMetadata){
			
		},
		hideMasterInProtrait:function(){
			
		},
		getODataHelpe:function(){
			
		},
		prepareForDelete:function(sProductId){
			
		},
		destroySupplierCard:function(){
			
		},
		setAppBusy:function(){
			
		},
		resetAppBusy:function(){
			
		}
	});
});

