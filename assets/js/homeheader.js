$(window).scroll(function(){
    if ($(window).scrollTop() >= 100) {
        $('#hw').addClass('fix-sticky');
    }
    else {
        $('#hw').removeClass('fix-sticky');
    }
});
