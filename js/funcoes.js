$(document).ready(function() {
	$(document).ready(function(){
		$('a[href^="#"]').on('click',function (e) {
		    e.preventDefault();

		    var target = this.hash;
		    var $target = $(target);

		    $('html, body').stop().animate({
		        'scrollTop': $target.offset().top
		    }, 500, 'swing', function () {
		        window.location.hash = target;
		    });
		});
	});

	$('#enviar').click(function(){
		var nome = $('#nome').val();
		var email = $('#email').val();
		var mensagem = $('#mensagem').val();

		$.ajax({
			type: "POST",
			url: "//formspree.io/amandavilelaalmeida@gmail.com",
			data: "nome=" + nome + "&email=" + email + "&mensagem=" + mensagem,
			success: function(data){
				$('#retorno').html(data);
			},
			beforeSend: function(){
				$('.loading').fadeIn('fast');
			},
			complete: function(){
				$('.loading').fadeOut('fast');
			}
		});
		return false;
	});
});
