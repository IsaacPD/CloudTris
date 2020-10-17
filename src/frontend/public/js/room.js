function addRoom() {
    $.ajax({
        type: "POST",
        url: "/addroom",
        success: function(room) {
            $("#rooms").append($(`<a href="/room/${room.id}">${room.id}</a>`))
        }
    })
}
