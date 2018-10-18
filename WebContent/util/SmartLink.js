sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/comp/navpopover/Factory"
], function(BaseObject,Factory) {
	"use strict";
	
	var Util=BaseObject.extend("sap.ui.rta.test.SmartLink",{});
	
	Util.getServiceReal = Factory.getService;
	
	var mSetting = {
		semanticObjectSupplierId:{
			links:[
				{
					action:"action_addtofavorites",
					intent:"#1",
					text:"Add to Favorites"
				},{
					action:"action_gotoproducts",
					intent:"#2",
					text:"See other supplier porducts"
				},{
					action:"action_gotoreviews",
					intent:"#3",
					text:"Check supplier reviews"
				}
			]
		}	
	};
	
	Util.ockUShellServices = function(){
		Factory.getService = function(sServiceName){
			switch(sServiceName){
			case "CrossApplicationNavigation":
				return {
					hrefForExternal:function(oTarget){
						if(!oTarget || !oTarget.target || !oTarget.target.shellHash){
							return null;
						}
						return oTarget.target.shellHash;
					},
					getDistinctSemanticObjects:function(){
						var aSemanticObjects = [];
						for(var sSemanticObject in mSetting){
							aSemanticObjects.push(sSemanticObject);
						}
						var oDeferred = jQuery.Deferred();
						setTimeout(function(){
							oDeferred.resolve(aSemanticObjects);
						},0);
						return oDeferred.promise();
					}
			};
			case "URLParsing":{
				return {
					parseShellHash:function(sIntent){
						var sAction;
						
					}
				}
			} 
			}
		}
	};
});