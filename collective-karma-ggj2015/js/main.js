require([
    'jquery',
    'lodash',
    'parse',
    'views/content/base'
],
function($, _, Parse, BaseContentView) {

    Parse.View.prototype.close = function() {
        if (this.beforeClose) {
            this.beforeClose();
        }
        this.remove();
        this.unbind();
    };

    var AppRouter = Parse.Router.extend({

        initialize: function() {
            this.contentDiv = "#content";
            this.viewInstances = [];
            
            var that = this;
            
            // CHANGE THIS TO INITIALIZE PARSE (needed to do db interactions);
            Parse.initialize("v4U89I3Yaqg1CXuDx4rR35sTvxUZTjzXBRHM4HE9", "5uTSKVeUg4dUZAk34yrExC3DJYXXd1BYqMDgexQr");
            Parse.Config.get().then(function() {
               that.renderAt(that.contentDiv, new BaseContentView()); 
            });
        },

        routes: {
            "" : "clear",
        },
        
        clear: function(event) {
        },
        
        renderAt: function(div, view) {
            this.removeRenderAt(div);
            if (view) {
                $(div).html(view.render());
                this.currentView[div] = view;
            }
            
            return view;
        },
        
        removeRenderAt: function(div) {
            if (!this.currentView) {
                this.currentView = [];
            }
            if (this.currentView[div]) {
                this.currentView[div].close();
                this.currentView[div] = null;
            }
        },
        
        isRenderActive: function(div) {
            if (!this.currentView) {
                this.currentView = [];
            }
            if (this.currentView[div]) {
                return true;
            }
            return false;
        },
        
        getView: function(div) {  
            if (!this.currentView) {
                this.currentView = [];
            }
            return this.currentView[div];
        },

    });

    window.app = new AppRouter();
    Parse.history.start();

}); // End require
