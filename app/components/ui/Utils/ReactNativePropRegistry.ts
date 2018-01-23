let objects = {}
let uniqueID = 1
let emptyObject = {}

export class ReactNativePropRegistry {
	public static register(object) {
		let id = ++uniqueID
		objects[id] = object
		return id
	}

	public static getByID(id) {
		if (!id) {
			// Used in the style={[condition && id]} pattern,
			// we want it to be a no-op when the value is false or null
			return emptyObject
		}

		let object = objects[id]
		if (!object) {
			console.warn("Invalid style with id `" + id + "`. Skipping ...")
			return emptyObject
		}
		return object
	}
}
