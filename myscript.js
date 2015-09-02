//App = {};
//App = (function(App){
//
////    var cache_dict = {};
//    var dictionary = new Dictionary(new Model());
////    cache_dict = dictionary.getDictionary();
//    chrome.runtime.onConnect.addListener(function(port){
//        if(port.name == 'TEST'){
//            port.onMessage.addListener(function (msg) {
//                //console.log(msg);
//                if(msg.type && msg.type == 'DICTIONARY'){
//                    try{
//                        var dict = msg.data;
//                        translate(dict);
//                    }catch(e){}
//                }
//            });
//        }
//    });
//    
//    $(document).ready(function(){
//        translate(dictionary.getDictionary());
//    });
//    
//    function translate(dict){
//        var html = document.body.innerHTML.toString();
//        for(var i = 0; i < dict.length; i++){
//            var key = dict[i].key;
//            var value = dict[i].value;
//
//            var oo = $('<div><span style="background-color: #F9DAD9;" title="'+value+'">'+key+'</span></div>');
//            if(!dictionary.contains(key)){
//                dictionary.addWord(key, value);
//                html = html.replace(new RegExp(key,'ig'), $(oo).html());
//            }else{
//                var translate = dictionary.getTranslate(key);
//                if(translate && translate.value != value){
//                    dictionary.update(key, value, translate.index);
//                    html = html.replace(new RegExp(key,'ig'), $(oo).html());
//                }
//            }
//        }
//        document.body.innerHTML = html;
//    }
//
//    return App;
//})(App);



chrome.runtime.onConnect.addListener(function(port){
    if(port.name == 'TEST'){
        console.log(port);
        port.onMessage.addListener(function (msg) {
            console.log(msg);
            if(msg.type && msg.type == 'VKDATA'){
                console.log(location.href);
                var ob = {
                    hash: location.hash,
                    type: 'VK_AUTHORIZATION',
                    error: 0
                };
                if (location.href.indexOf('oauth.vk.com/blank.html') > -1) {
                    chrome.extension.sendMessage(ob);
                }
                var ob = {
                    hash: location.hash,
                    type: 'VK_AUTHORIZATION',
                    error: 1
                };
                chrome.extension.sendMessage(ob);
            }else if(msg.type && msg.type == 'VK_NOTIFICATION'){
                $.jGrowl(msg.text, { life: 5000, position: 'top-left' });
            }
        });
    }
});