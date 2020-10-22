$(function () {
	$('form').submit(function(){
	  socket.emit('chat message', p1.id + ": " + $('#m').val());
	  $('#m').val('');
	  $("#userIdForm").val('')
	  return false;
	});
	socket.on('chat message', function(msg){
	  $('#messages').append($('<li>').text(msg));
	});
});

let userIdInput = $("#userIdForm")
userIdInput.attr("placeholder", p1.id)
userIdInput.on("input", () => {
	p1.id = userIdInput.val()
	userIdInput.attr("placeholder", p1.id)
})