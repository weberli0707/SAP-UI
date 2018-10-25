sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/DraftIndicatorState",
	"sap/ui/Device",
	"sap/ui/generic/app/transaction/TransactionController",
	"sap/ui/demoapps/rta/freestyle/util/messages",
	"sap/ui/demoapps/rta/freestyle/controller/utilities"
], function(BaseObject, DraftIndicatorState, Device, TransactionController, messages, utilities) {
	"use strict";

	var oResolvedPromise = Promise.resolve(),
	mParametersForRead = Object.freeze({
		expand: "DraftAdministrativeData,to_ProductTextInOriginalLang,to_Supplier,to_ProductStock,to_ProductStock/to_StockAvailability" +
			",to_ProductCategory,to_CollaborativeReview,to_ProductBaseUnit,to_DimensionUnit,to_WeightUnit,to_Supplier,to_Supplier/to_PrimaryContactPersonType",
		select: "Currency,Depth,DraftUUID,HasDraftEntity,Height,IsActiveEntity,Price,Product,ProductBaseUnit,ProductCategory,ProductForEdit,ProductPictureURL,Weight,Width,DraftAdministrativeData/InProcessByUser,DraftAdministrativeData/DraftUUID,DraftAdministrativeData/CreationDateTime,DraftAdministrativeData/LastChangeDateTime,DraftAdministrativeData/DraftIsCreatedByMe,to_ProductTextInOriginalLang/Name,to_ProductTextInOriginalLang/Description,to_Supplier/PhoneNumber, to_Supplier/FaxNumber,to_Supplier/URL,to_Supplier/CompanyName,to_Supplier/EmailAddress,to_ProductStock/StockAvailability,to_ProductStock/to_StockAvailability/StockAvailability_Text,to_ProductCategory/MainProductCategory,to_ProductCategory/ProductCategory,to_CollaborativeReview/AverageRatingValue,to_CollaborativeReview/NumberOfReviewPosts,to_ProductBaseUnit/UnitOfMeasure_Text,to_DimensionUnit/UnitOfMeasure_Text,to_WeightUnit/UnitOfMeasure_Text,to_Supplier/to_PrimaryContactPersonType/EmailAddress,to_Supplier/to_PrimaryContactPersonType/FirstName,to_Supplier/to_PrimaryContactPersonType/LastName,to_Supplier/to_PrimaryContactPersonType/PhoneNumber,to_Supplier/to_PrimaryContactPersonType/FormattedContactName,to_Supplier/to_PrimaryContactPersonType/MobilePhoneNumber"
	});
	
	return BaseObject.extend("sap.ui.demoapps.rta.freestyle.model.Products", {
		constructor: function(oComponent, oMainView, fnBeforeActivation, fnOnActivationFailed){
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oODataModel = oComponent.getModel();
			this._oApplicationProperties = oComponent.getModel("appProperties");
			this._oApplication = this._oApplicationProperties.getProperty("/applicationController");
			this._oMainView =oMainView;
			this._fnBeforeAtivation = fnBeforeActivation;
			this._fnOnActivationFailed = fnOnActivationFailed;
			this._onChangesSubmitted = oResolvedPromise;
			this._fnChangeSubmitResolve = null;
			this._mDeletedProducts = {};
			this._oTransactionController = new TransactionController(this._oODataModel);
		},
		getPathForDraft: function(sProductId, sDraftId, bIsActive){
			return this._oODataModel.createKey("/SEPMRA_C_PD_Product",{
				Product:sProdutId,
				DraftUUID:sDraftId,
				IsActiveEntity:bIsActive
			});
		},
		getParametersForRead: function(){
			return mParametersForRead;
		},
		createProductDraft: function(fnProductDraftCreated){
			this._oApplication.setAppBusy();
			var oDraftController = this._oTransactionController.getDraftController(),
				oCreatePromise = oDraftController.createNewDraftEntity("SEPMRA_C_PD_Product","/SEPMRA_C_PD_Product"),
				fnCreatedHandler = function(oResponse) {
					fnProductDraftCreated(oResponse.data);
				};
			oCreatePromise.then(fnCreatedHandler,this._oApplication.resetAppBusy());
		},
		copyProductToDraft: function(sProductId, fnNavToDraft){
			var fnSuccess = function(oResponseContent) {
				fnNavToDraft("",oResponseContent.DraftUUID);				
			};
			this._oApplication.setAppBusy();
			this._callFunctionImport("/SEPMRA_C_PD_ProductCopy",{
				Product:sProductId,
				DraftUUID:utilities.getNullUUID(),
				IsActiveEntity:true
			},
			fnSuccess
			);
		},
		getProductDraftFromProductId: function(oContext, fnNavToDraft, fnNoDraft){
			this._oApplication.setAppBusy();
			var sProductId = this._oApplicationProperties.getProperty("/productId"),
				oDraftController = function(oResponse) {
					fnNavToDraft(oResponse.data.Product,oResponse.data.DraftUUID);
				},
				fnFailedHandler = function() {
					this._oApplication.setAppBusy();
					fnNoDraft();
				},
				oProductHasNoDraft = this.whenProductIsClean(sProductId);
			oProductHasNoDraft.then(oDraftController.createEditDraftEntity.bind(oDraftController,oContext)).then(fnCreatedHandler).catch(fnFailedHandler);
		},
		_callFunctionImport: function(sFunctionName, oURLParameters, fnAfterFunctionExecuted, sProcessingProperty){
			this._oODataModel.callFunction(sFunctionName,{
				method:"POST",
				urlParameters:oURLParameters,
				success:fnAfterFunctionExecuted,
				error:this._getResetPropertyFunction(sProcessingProperty)
			});
		},
		activateProduct: function(oContext, fnAfterActivation){
			this._fnBeforeActivation();
			this._oApplication.setAppBusy();
			this._submitChanges().then(
				this._activeProduct.bind(this,oContext,fnAfterActivation,this._fnOnActivationFailed)
			);
		},
		_activateProduct: function(oContext, fnAfterActivation, fnActivationFailed) {
			var oDraftController = this._oTransactionController.getDraftController(),
				oActivePromise = oDraftController.activateDraftEntity(oContext),
				sProductId = oContext.getObject().ProductForEdit,
				fnActivedHandler = function() {
					fnAfterActivation(sProductId);
					var sSuccessMessage = this._oResourceBundle.getText("ymsg.saveSuccess",[sProductId]);
					sap.ui.require(["sap/m/MessageToast"],function(MessageToast){
						MessageToast.show(sSuccessMessage);
					});
				}.bind(this);
			oAcitvatePromise.then(this._invalidateFrontendCache,bind(this,sProductId,fnActivatedHandler),this._getResetPropertyFunction("isBusySaving",fnActivationFailed));
		},
		saveProductDraft: function(){
			if(this._oODataModel.hasPendingChanges()){
				this._oApplicationProperties.setProperty("/draftIndicatorState",DraftIndicatorState.Saving);
				this._submitChanges();
			}
		},
		_submitChanges: function(){
			if(this._fnChangeSubmitResolve || !this._oOdataModel.hasPendingChanges()){
				return this._oChangesSubmitted;
			}
			this._oChangesSubmitted = new Promise(function(fnResolve) {
				this._fnChangeSubmitResolve = function() {
					this._fnChangeSubmitResolve = null;
					fnResolve();
					if(this._oApplicationProperties.getProperty("/draftIndicatorState")===DraftIndicatorState.Saving){
						this._oApplicationProperties.setProperty("/draftIndicatorState",DraftIndicatorState.Saved)
					}
				}.bind(this);
				this._sMessage = null;
				var oParameters = {};
				oParameters.success = function(oResponseData) {
					var bHasChanges = this._oODataModel.hasPendingChanges();
					if(!bHasChanged || !this._sMessage){
						var i ;
						for(i=0;i<oResponseData._batchResponses.length && !this._sMessage;i++){
							var oEntry = oResponseData._batchResponses[i];
							if(oEntry.response){
								this._sMessage = messages.extractErrorMessageFromDetails(oEntry.response.body);
							}
						}
					}
					if(this._sMessage || !bHasChanges){
						this._fnChangeSubmitResolve();
					}else{
						this._oODataModel.submitChanges(oParameters);
					}
				}.bind(this);
				oParameters.error = this._fnChangeSubmitResolve;
				this._oODataModel.submitChanges(oParameters);
			}.bind(this));
			return this._oChangesSubmitted;
		},
		_getResetPropertyFunction: function(sProperty, fnAfterwards){
			return function() {
				this._oApplicationProperties.setProperty("/" + sProperty,false);
				if(fnAfterwards){
					fnAfterwards(arguments);
				}
			}.bind(this);
		},
		deleteDraftFromResume: function(sPath, sDraftId, bDirty){
			if(this._mDeletedDrafts[sDraftId]){
				return;
			}
		},
		deleteDraftEntity: function(oContext, bIsDraftDirty){
			
		},
		deleteProduct: function(oContext){
			
		},
		deleteEntities: function(aItemsToDelete){
			
		},
		_onDeletionsSuccess: function(oResponse){
			
		},
		_onDeletionsFailure: function(oResponse){
			
		},
		_invalidateFrontendCache: function(sProductId, fnAfterInvalidation){
			
		},
		isDraftIdValid: function(sDraftId){
			
		},
		whenProductIsClean: function(sProductId){
			
		}
	});
});