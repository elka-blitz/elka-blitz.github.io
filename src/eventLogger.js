// Class for logging events
// Timber!
import { textDownload } from "./csvFunctions"

export default class EventLogger {
    constructor() {
        this.stylus_data_push_line = {}
        this.stylus_data_log = []
        this.task_event_data_push_line = {}
        this.task_event_data_log = []
    }

    logStylusData(stylus) {

		// Update variables explicitly locally
		let stylus_position			 	= [stylus.position.x, stylus.position.y, stylus.position.z]
		let stylus_angular_velocity		= [stylus.angularVelocity.x, stylus.angularVelocity.y, stylus.angularVelocity.z]
		let stylus_linearVelocity 		= [stylus.linearVelocity.x, stylus.linearVelocity.y, stylus.linearVelocity.z]
		let stylus_rotation 			= [stylus.rotation._x, stylus.rotation._y, stylus.rotation._z]
		let stylus_quaternion 			= [stylus.quaternion]

        this.stylus_data_push_line = {
			t: Date.now(),
			s: stylus_position,
			a: stylus_angular_velocity,
			l: stylus_linearVelocity,
			r: stylus_rotation,
			q: stylus_quaternion
		}
        this.stylus_data_log.push(this.stylus_data_push_line)
    }

    logEventData(data_title) {
        // Automatically adds timestamp
        // This function logs arbitrary task titles with its timestamp
        this.task_event_data_push_line = {
            timestamp: Date.now(),
            event: data_title
        }
        this.task_event_data_log.push(this.task_event_data_push_line)
    }

    downloadAllData() {
        let stylus_data_string = JSON.stringify(this.stylus_data_log)
        let task_event_data_string = JSON.stringify(this.task_event_data_log)

        textDownload(stylus_data_string, "stylus_data")
        textDownload(task_event_data_string, "task_event_data")
    }
}