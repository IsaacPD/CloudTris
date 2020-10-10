var modal = $("#settingsModal");
var btn = $("#modalButton");
var span = $(".close");
btn.click(function() {
	modal.css("display", "block");
})
span.click(function() {
	modal.css("display", "none");
})
window.onclick = function(event) {
  if (event.target == modal) {
	modal.css("display", "none");
  }
}

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

	let buttonCol = $("<td>").append($('<button/>', {text: input}))
	let textInputCol = $("<td>").append(textInput)

	row.append(buttonCol)
	row.append(textInputCol)
	table.append(row)
}

content.append(table)
