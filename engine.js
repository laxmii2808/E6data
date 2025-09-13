// Add this function to your routes file or a new 'engine.js' file

function executeQuery(command) {
    // Regex to match "collection.find({ ... })" or "collection.find()"
    const findRegex = /^(\w+)\.find\((.*)\)$/;
    const match = command.match(findRegex);

    if (!match) {
        throw new Error("Invalid command format. Use 'collection.find()' or 'collection.find({ ... })'.");
    }

    const collectionName = match[1];
    const queryStr = match[2].trim();

    if (!mockDB[collectionName]) {
        throw new Error(`Collection '${collectionName}' not found.`);
    }

    let data = mockDB[collectionName];

    // If there is a query object inside find()
    if (queryStr) {
        try {
            const query = JSON.parse(queryStr);
            // Filter the data based on the query
            return data.filter(item => {
                return Object.keys(query).every(key => {
                    return item[key] === query[key];
                });
            });
        } catch (e) {
            throw new Error("Invalid JSON in query.");
        }
    }

    // If find() is empty, return all data from the collection
    return data;
}