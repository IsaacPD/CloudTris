$(function () {
	$('form').submit(function(){
	  socket.emit('chat message', p1.id + ": " + $('#m').val());
	  $('#m').val('');
	  return false;
	});
	socket.on('chat message', function(msg){
	  $('#messages').append($('<li>').text(msg));
	  window.scrollTo(0, document.body.scrollHeight);
	});
});

let userIdInput = $("#userIdForm")
userIdInput.attr("placeholder", p1.id)
userIdInput.on("input", () => {
	p1.id = userIdInput.val()
})