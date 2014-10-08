exports.definition = {
    config: {
	columns: {
	    id: 'INTEGER PRIMARY KEY',
	    bage: 'TEXT',
            date: 'TEXT',
	    text: 'TEXT'
	},
	adapter: {
	    type: 'sql',
	    collection_name: 'log',
	    idAttribute: 'id'
	}
    }
};
