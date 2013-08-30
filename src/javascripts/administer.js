(function(){

"use strict";

window.modulesLoded = function(){
    var topNav = $("#topNav"),
        nav = $("#nav"),
        navTop = nav.offset().top,
        content = $("#content"),
        saveBtn = "#topNav #save";

    nav.tree({
        dataUrl: "/administer/articles.json",
        autoOpen: true,
        autoScroll: true,
        autoEscape: false
    });

    $(document).on("click","a.article",function(e){
        e.preventDefault();
        var nodeId = $(this).attr("node");
        $.get("/administer/articles.json" + $(this).attr("href")).success(function(data){
            content.find("form > textarea").val(data);
            content.find("form > #nodeId").val(nodeId);
            $(saveBtn).addClass("active");
        });
    }).on("click",saveBtn + ".active",function(e){
        var form = content.children("form");
//        $.post(form.attr("action"),{
//            node: form.find("#nodeId").val(),
//            data: form.children("textarea").val()
//        }).complete(function(data){
//            alert(data.responseText);
//        });
        $.post(form.attr("action"),form.serialize()).complete(function(data){
            alert(data.responseText);
        });
    });

    $(window).scroll(function(){
        var s = navTop - $(this).scrollTop();
        nav.css("top",s > 10 ? s:10);
    }).resize(function(){
            content.find("form > textarea").add("#nav")
                .css("height",$(window).height()-topNav.outerHeight()-
                (content.css("padding-top").match(/\d+/))-
                (content.css("padding-bottom").match(/\d+/)));
    }).resize();

}

})();