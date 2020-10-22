const modal = $("#settingsModal");
const btn = $("#modalButton");
const span = $("#settingsModalClose");
btn.click(function() {
	modal.css("display", "block");
})
span.click(function() {
	modal.css("display", "none");
})

let content = $("#settingsContent")
let table = $("<table>")

for (let input in KeyToInput) {
	let row = $("<tr>")

	let textInput = $("<input type='text' readonly>").val(KeyToInput[input])

	let windowEvent = function(event) {
		if (event.defaultPrevented) {
			return; // Do nothing if the event was already processed
		}

		KeyToInput[input] = key
		textInput.val(key)
		window.removeEventListener("keydown", windowEvent)
	}

	textInput.on('focus', function() {
		window.addEventListener("keydown", windowEvent)
	})

	let buttonCol = $("<td>").append($('<label/>', {text: input}))
	let textInputCol = $("<td>").append(textInput)

	row.append(buttonCol)
	row.append(textInputCol)
	table.append(row)
}

let settingsTable = $("<table>")

for (let setting in Settings) {
	let row = $("<tr>")

	let textInput = $("<input type='text'>").val(Settings[setting])

	let setValue = function() {
		customSettings = true
		Settings[setting] = Number(textInput.val())
	}

	textInput.on('input', setValue)

	let buttonCol = $("<td>").append($('<label/>', {text: setting}))
	let textInputCol = $("<td>").append(textInput)

	row.append(buttonCol)
	row.append(textInputCol)
	settingsTable.append(row)
}

content.append(table)
content.append(settingsTable)

window.addEventListener("keydown", function(e) {
    if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);