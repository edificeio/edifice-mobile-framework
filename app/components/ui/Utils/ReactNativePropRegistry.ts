var objects = {}
var uniqueID = 1
var emptyObject = {}

export class ReactNativePropRegistry {
	static register(object) {
		var id = ++uniqueID
		objects[id] = object
		return id
	}

	static getByID(id) {
		if (!id) {
			// Used in the style={[condition && id]} pattern,
			// we want it to be a no-op when the value is false or null
			return emptyObject
		}

		var object = objects[id]
		if (!object) {
			console.warn("Invalid style with id `" + id + "`. Skipping ...")
			return emptyObject
		}
		return object
	}
}
