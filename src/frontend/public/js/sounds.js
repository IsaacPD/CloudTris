const soundModal = $("#soundModal");
const soundBtn = $("#soundButton");
const soundSpan = $("#soundModalClose");
soundBtn.click(function() {
	soundModal.css("display", "block");
})
soundSpan.click(function() {
	soundModal.css("display", "none");
})

let soundContent = $("#soundContent")
let soundInput = $("#userSounds")
soundInput.change(() => {
	soundContent.empty()
	let files = soundInput.prop('files')
	let row = $("<div class='row'>")
	console.log(files)

	for (let sound in SoundEffectsMap) {
		let id = sound + 'DropDownButton'
		let dropDown = $('<div class="dropdown">')
		let dropDownButton = $(`<button type='button' class='btn btn-secondary dropdown-toggle m-1' id="${id}" data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' >`)
		dropDownButton.text(sound + " sound")

		let dropDownMenu = $(`<div class="dropdown-menu" aria-labelledby="${id}">`)
		for (let file of files) {
			let item = $(`<a class="dropdown-item" href="#">`)
			let url = URL.createObjectURL(file);
			item.text(file.name)
			item.click(() => {
				SoundEffectsMap[sound] = new Howl({
					src: [url],
					format: [file.name.slice(file.name.lastIndexOf('.') + 1)]
				})
			})
			dropDownMenu.append(item)
		}
		dropDown.append(dropDownButton)
		dropDown.append(dropDownMenu)
		row.append(dropDown)
	}
	soundContent.append(row)
	console.log(soundContent)
})