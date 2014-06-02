var MyTubeMutationObserver = function() {
    var MutationObserver = function(logger) {
        this._logger = logger;
        this._addedCallbacks = [];
        this._removedCallbacks = [];
    };

    MutationObserver.prototype._runCallbacks = function(callbacks) {
        var logger = this._logger;
        for(var i=0, len = callbacks.length; i<len; i++) {
            try {
                callbacks[i]();
            } catch(ex) {
                logger.error("Error while calling observer callback", ex);
            }
        }
    };

    MutationObserver.prototype._startObservation = function() {
        if(this._observationStarted) {
            return;
        }
        this._observationStarted = true;
        var me = this;
        var observer = new (window.WebKitMutationObserver || window.MutationObserver)(function(mutations) {
            var somethingAdded, somethingRemoved;
            for(var i=0, len = mutations.length; i < len; i++) {
                var mutation = mutations[i];
                if(mutation.addedNodes && mutation.addedNodes.length > 0) {
                    somethingAdded = true;
                }
                if(mutation.removedNodes && mutation.removedNodes.length > 0) {
                    somethingRemoved = true;
                }
            }
            if(somethingAdded) {
                me._runCallbacks(me._addedCallbacks);
            }
            if(somethingRemoved) {
                me._runCallbacks(me._removedCallbacks);
            }
        });
        observer.observe(document, {childList: true, subtree: true, attributes:false, characterData: false});                 
    };

    MutationObserver.prototype.observeAdded = function(callback) {
        this._addedCallbacks.push(callback);
        this._startObservation();
    };

    MutationObserver.prototype.observeRemoved = function(callback) {
        this._removedCallbacks.push(callback);
        this._startObservation();
    };

    return MutationObserver;
}();