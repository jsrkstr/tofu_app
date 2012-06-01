// Override the backbone sync 
(function() {
    var origSync = Backbone.sync;
    
    Backbone.sync = function(method, model, options) {
        var backend = model.backend || (model.collection && model.collection.backend);
        
        var error = options.error || function() {};
        var success = options.success || function() {};
        
        // Don't pass the callbacks to the backend
        // delete options.error;
        // delete options.success;

        var handleResponse = function(data){
            if(data.error)
                error();
            else
                success(data);
        };
        
        if (backend) {

            // fetch 
            if(method == "read" && !model){ 
                App.socket.emit("history", backend, handleResponse);
            }

            // create
            if(method == "create" && model){
                App.socket.emit("publish", model, handleResponse);
            } 

        } else {
            // Call the original Backbone.sync
            origSync(method, model, options);
        }
    };

})();