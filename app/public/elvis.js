(function (window,undefined,$) {
    $(function(){
        window.elvis.defaultActiveTab=$(".nav[rem] li.active a").attr("href");
    });

    window.elvis = {
        defaultActiveTab:"",
        elmAttrs:{
            navRem:"rem",
            ajaxElm:"ajaxElm"
        }
    };

    $("body").on("click", ".nav[rem] li a", function () {
        location.href = $(this).attr("href");
    });

    $(window).bind("hashchange", function () {
        var hash = window.location.hash || elvis.defaultActiveTab;

        var elm = $("a[href='"+hash+"']").click();

        if (hash = (elm = $(hash)).attr(elvis.elmAttrs.ajaxElm))
            elm.load(hash);

    });

})(window,undefined,window.jQuery);

