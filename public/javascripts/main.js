requirejs.config({
    paths:{
        jquery:'jquery-3.1.1.min'
    }
});

requirejs(['jquery'],function($){
    $('#backTop').on('click',move);
    $(window).on('scroll',function(){
        checkPosition($(window).height());
    });
    checkPosition($(window).height());
    function move(){
        $('html, body').animate({
            scrollTop:0
        }, 1000);
    }
    function checkPosition(pos){
        if($(window).scrollTop()>pos){
            $('#backTop').fadeIn();
        }
        else{
            $('#backTop').fadeOut();
        }
    }

});