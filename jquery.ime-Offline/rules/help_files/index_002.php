addOnloadHook(function() {
    var currentTime = new Date()
    var month = currentTime.getMonth() + 1
    if (month<10) {
        month = "0" + month
    }
    var year = currentTime.getFullYear()
    url = "http://stats.grok.se/or/" + year + month + "/" + wgPageName;
 
    addPortletLink("p-tb", url, "ପୃଷ୍ଠା ଦେଖା ଆକଳନ", "pt-logs");
});