var _ = require("alloy/underscore")._;

exports.definition = {
    config: {
	columns: {
	    id: 'INTEGER PRIMARY KEY',
	    kind: 'TEXT',
	    status: 'TEXT',
	    title: 'TEXT',
	    body: 'TEXT'
	},

	adapter: {
	    type: 'sql',
	    collection_name: 'task',
	    idAttribute: 'id'
	}
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {
            initialize: function() {
                this.cache = null;
            },
            get_body: function(name) {
                if(!this.cache) {
                    this.cache = JSON.parse(this.get('body'));
                }
                return this.cache[name];
            }
        });
        return Model;
    }
};
