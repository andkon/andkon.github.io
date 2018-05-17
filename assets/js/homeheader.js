$(window).scroll(function(){
    if ($(window).scrollTop() >= 150) {
        $('#hw').addClass('fix-sticky');
    }
    else {
        $('#hw').removeClass('fix-sticky');
    }
});
